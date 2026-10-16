-- Cupons de desconto (afiliados). Só a service role acessa: o navegador valida o cupom por uma rota do servidor.

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Código sempre em MAIÚSCULAS, sem espaços (o servidor normaliza antes de buscar).
  code TEXT NOT NULL CHECK (code = upper(btrim(code)) AND code ~ '^[A-Z0-9_-]{3,32}$'),
  -- 'fixed_price': o cupom define o PREÇO a pagar (tabela coupon_prices, por data). 'percent': desconto percentual sobre o preço do site.
  discount_type TEXT NOT NULL DEFAULT 'fixed_price' CHECK (discount_type IN ('fixed_price', 'percent')),
  discount_percent NUMERIC(9,6) CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent < 100)),
  active BOOLEAN NOT NULL DEFAULT true,
  affiliate_name TEXT CHECK (affiliate_name IS NULL OR char_length(affiliate_name) <= 120),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);

-- Preço do cupom por período (cupom 'fixed_price'). Vale a linha cuja janela contém o momento atual.
-- O preço do cupom é uma coisa; o desconto do cronômetro da oferta é outra: um não se soma ao outro.
CREATE TABLE IF NOT EXISTS public.coupon_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),
  starts_at TIMESTAMPTZ,            -- null = desde sempre
  ends_at TIMESTAMPTZ,              -- null = sem fim; o instante final NÃO entra na janela
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (starts_at IS NULL OR ends_at IS NULL OR starts_at < ends_at)
);
CREATE INDEX IF NOT EXISTS idx_coupon_prices_coupon ON public.coupon_prices (coupon_id, starts_at);

-- Cada cobrança feita com cupom (relatório de vendas por afiliado).
CREATE TABLE IF NOT EXISTS public.coupon_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asaas_payment_id TEXT NOT NULL UNIQUE,
  coupon_id UUID REFERENCES public.coupons(id) ON DELETE SET NULL,
  coupon_code TEXT NOT NULL,
  product_id TEXT NOT NULL,
  original_price NUMERIC(10,2) NOT NULL CHECK (original_price >= 0),
  discount_amount NUMERIC(10,2) NOT NULL CHECK (discount_amount >= 0),
  final_price NUMERIC(10,2) NOT NULL CHECK (final_price >= 0),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CONFIRMED')),
  -- true depois que o uso foi somado ao contador do cupom (só acontece uma vez, quando o pagamento é confirmado)
  counted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_coupon_orders_coupon ON public.coupon_orders (coupon_id, status);
CREATE INDEX IF NOT EXISTS idx_coupon_orders_created ON public.coupon_orders (created_at DESC);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_prices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public.coupons;
DROP POLICY IF EXISTS deny_all_client_access ON public.coupon_orders;
DROP POLICY IF EXISTS deny_all_client_access ON public.coupon_prices;
CREATE POLICY deny_all_client_access ON public.coupons FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY deny_all_client_access ON public.coupon_orders FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY deny_all_client_access ON public.coupon_prices FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.coupons FROM anon, authenticated;
REVOKE ALL ON TABLE public.coupon_orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.coupon_prices FROM anon, authenticated;

-- Confirma o pedido e soma 1 uso, de forma atômica e uma única vez por pagamento (webhook repetido não soma de novo).
CREATE OR REPLACE FUNCTION public.confirm_coupon_order(p_payment_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_coupon_id UUID;
BEGIN
  UPDATE public.coupon_orders
     SET status = 'CONFIRMED', confirmed_at = pg_catalog.now(), counted = true
   WHERE asaas_payment_id = p_payment_id AND counted = false
   RETURNING coupon_id INTO v_coupon_id;
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  IF v_coupon_id IS NOT NULL THEN
    UPDATE public.coupons SET used_count = used_count + 1 WHERE id = v_coupon_id;
  END IF;
  RETURN true;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.confirm_coupon_order(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_coupon_order(TEXT) TO service_role;

-- Cupom MAGIC (afiliado): R$ 67 até 31/10/2026 às 23:59:59 (horário de Brasília) e R$ 95 a partir de 01/11/2026.
INSERT INTO public.coupons (code, discount_type, discount_percent, active, affiliate_name)
VALUES ('MAGIC', 'fixed_price', NULL, true, 'MAGIC')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.coupon_prices (coupon_id, price, starts_at, ends_at)
SELECT c.id, v.price, v.starts_at, v.ends_at
FROM public.coupons c
CROSS JOIN (VALUES
  (67.00::numeric, NULL::timestamptz, TIMESTAMPTZ '2026-11-01 00:00:00-03'),
  (95.00::numeric, TIMESTAMPTZ '2026-11-01 00:00:00-03', NULL::timestamptz)
) AS v(price, starts_at, ends_at)
WHERE c.code = 'MAGIC'
  AND NOT EXISTS (SELECT 1 FROM public.coupon_prices cp WHERE cp.coupon_id = c.id);
