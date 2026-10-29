-- Black November do Color Master Produtos (R$ 195 por R$ 67, 7 minutos por pessoa).

-- 1. Cronômetro da oferta: aparelho (HMAC de IP + navegador) para quem apaga o cookie não ganhar outros 7 minutos,
--    e o instante em que a pessoa clicou em comprar (o cronômetro para ali).
ALTER TABLE public.offer_timer_sessions
  ADD COLUMN IF NOT EXISTS device_hash TEXT CHECK (device_hash IS NULL OR char_length(device_hash) = 64),
  ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_offer_timer_device_first_access
  ON public.offer_timer_sessions (device_hash, first_access_at DESC) WHERE device_hash IS NOT NULL;

-- 2. Inscritos para avisar do início da Black November. Só a service role (rota /api/black-november/lead) acessa.
CREATE TABLE IF NOT EXISTS public.black_november_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 2 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(btrim(email))),
  -- Opcional. Só dígitos, com DDD (10 ou 11 dígitos)
  phone TEXT CHECK (phone IS NULL OR phone ~ '^[0-9]{10,11}$'),
  -- HMAC do IP (nunca o IP em claro); pode ser nulo
  ip_hash TEXT CHECK (ip_hash IS NULL OR char_length(ip_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_black_november_leads_created ON public.black_november_leads (created_at DESC);

ALTER TABLE public.black_november_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public.black_november_leads;
CREATE POLICY deny_all_client_access ON public.black_november_leads FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.black_november_leads FROM anon, authenticated;
