-- Cupons de desconto (afiliados). Só a service role acessa: o navegador valida o cupom por uma rota do servidor.

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Código sempre em MAIÚSCULAS, sem espaços (o servidor normaliza antes de buscar).
  code TEXT NOT NULL CHECK (code = upper(btrim(code)) AND code ~ '^[A-Z0-9_-]{3,32}$'),
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent')),
  -- Percentual de desconto com 6 casas: 29.473684 = (1 - 67/95) × 100, o que dá exatamente R$ 95 -> R$ 67.
  discount_percent NUMERIC(9,6) NOT NULL CHECK (discount_percent > 0 AND discount_percent < 100),
  active BOOLEAN NOT NULL DEFAULT true,
  affiliate_name TEXT CHECK (affiliate_name IS NULL OR char_length(affiliate_name) <= 120),
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  max_uses INTEGER CHECK (max_uses IS NULL OR max_uses > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (code);

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
DROP POLICY IF EXISTS deny_all_client_access ON public.coupons;
DROP POLICY IF EXISTS deny_all_client_access ON public.coupon_orders;
CREATE POLICY deny_all_client_access ON public.coupons FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY deny_all_client_access ON public.coupon_orders FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.coupons FROM anon, authenticated;
REVOKE ALL ON TABLE public.coupon_orders FROM anon, authenticated;

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

-- Cupom MAGIC (afiliado): 29,473684% = R$ 95 -> R$ 67 (e proporcional em qualquer outro preço).
INSERT INTO public.coupons (code, discount_type, discount_percent, active, affiliate_name)
VALUES ('MAGIC', 'percent', 29.473684, true, 'MAGIC')
ON CONFLICT (code) DO NOTHING;
