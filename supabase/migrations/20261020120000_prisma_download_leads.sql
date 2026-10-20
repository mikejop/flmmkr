-- Cadastros de quem baixa o PRISMA 2 (open beta). Tabela própria, separada do resto do sistema.
-- Só a service role (rota /api/prisma2/lead) lê e grava: o navegador não tem acesso nenhum.

CREATE TABLE IF NOT EXISTS public.prisma_download_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  last_name TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 80),
  company TEXT CHECK (company IS NULL OR char_length(company) BETWEEN 1 AND 120),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(btrim(email))),
  -- Telefone, estado e cidade são opcionais. Telefone: só dígitos, com DDD (10 ou 11 dígitos)
  phone TEXT CHECK (phone IS NULL OR phone ~ '^[0-9]{10,11}$'),
  state TEXT CHECK (state IS NULL OR state ~ '^[A-Z]{2}$'),
  city TEXT CHECK (city IS NULL OR char_length(city) BETWEEN 2 AND 80),
  -- HMAC do IP (nunca o IP em claro); pode ser nulo
  ip_hash TEXT CHECK (ip_hash IS NULL OR char_length(ip_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_prisma_download_leads_created ON public.prisma_download_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prisma_download_leads_email ON public.prisma_download_leads (email);

ALTER TABLE public.prisma_download_leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public.prisma_download_leads;
CREATE POLICY deny_all_client_access ON public.prisma_download_leads FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.prisma_download_leads FROM anon, authenticated;
