-- Split de pagamento do Asaas para afiliados: o cupom guarda a carteira Asaas do afiliado e o percentual dele.
-- O percentual vale sobre o preço da venda: o checkout manda ao Asaas o valor fixo (ex.: 30% de R$ 69 = R$ 20,70),
-- e o Asaas repassa direto para a conta do afiliado.

ALTER TABLE public.coupons
  ADD COLUMN IF NOT EXISTS affiliate_wallet_id TEXT CHECK (affiliate_wallet_id IS NULL OR affiliate_wallet_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
  ADD COLUMN IF NOT EXISTS affiliate_split_percent NUMERIC(5,2) CHECK (affiliate_split_percent IS NULL OR (affiliate_split_percent > 0 AND affiliate_split_percent < 100));

-- Percentual sem carteira: a venda só anota o valor do afiliado (repasse manual). Com carteira, o Asaas repassa sozinho.
ALTER TABLE public.coupons DROP CONSTRAINT IF EXISTS coupons_affiliate_split_pair;
ALTER TABLE public.coupons ADD CONSTRAINT coupons_affiliate_split_pair
  CHECK (affiliate_wallet_id IS NULL OR affiliate_split_percent IS NOT NULL);

-- O que valeu em cada venda (o cupom pode mudar depois): carteira, percentual e valor do afiliado naquela cobrança.
ALTER TABLE public.coupon_orders
  ADD COLUMN IF NOT EXISTS affiliate_wallet_id TEXT,
  ADD COLUMN IF NOT EXISTS affiliate_split_percent NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS affiliate_amount NUMERIC(10,2);
