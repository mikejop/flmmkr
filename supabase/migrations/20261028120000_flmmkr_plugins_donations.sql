-- Doações dos plugins FLMMKR (modal de doação da página /plugins). Tabela própria, separada do resto do sistema.
-- Só a service role (rota /api/plugins/donation) lê e grava: o navegador não tem acesso nenhum.
-- Dados do cartão nunca são guardados aqui; ficam só com o Asaas.

CREATE TABLE IF NOT EXISTS public."flmmkr-plugins-donations" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- externalReference da cobrança no Asaas (flmmkr_plugins_donation_<uuid>)
  reference TEXT NOT NULL UNIQUE CHECK (reference ~ '^flmmkr_plugins_donation_[0-9a-f-]{36}$'),
  method TEXT NOT NULL CHECK (method IN ('pix', 'card')),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 5 AND amount <= 5000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'refused')),
  asaas_payment_id TEXT CHECK (asaas_payment_id IS NULL OR char_length(asaas_payment_id) <= 120),
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  last_name TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 80),
  email TEXT NOT NULL CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(btrim(email))),
  -- Opcionais (obrigatórios só no cartão, exigência do Asaas)
  phone TEXT CHECK (phone IS NULL OR phone ~ '^[0-9]{10,11}$'),
  postal_code TEXT CHECK (postal_code IS NULL OR postal_code ~ '^[0-9]{8}$'),
  street TEXT CHECK (street IS NULL OR char_length(street) BETWEEN 1 AND 120),
  address_number TEXT CHECK (address_number IS NULL OR char_length(address_number) BETWEEN 1 AND 10),
  city TEXT CHECK (city IS NULL OR char_length(city) BETWEEN 2 AND 80),
  state TEXT CHECK (state IS NULL OR state ~ '^[A-Z]{2}$'),
  -- HMAC do IP (nunca o IP em claro); pode ser nulo
  ip_hash TEXT CHECK (ip_hash IS NULL OR char_length(ip_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_flmmkr-plugins-donations_created" ON public."flmmkr-plugins-donations" (created_at DESC);
CREATE INDEX IF NOT EXISTS "idx_flmmkr-plugins-donations_email" ON public."flmmkr-plugins-donations" (email);

ALTER TABLE public."flmmkr-plugins-donations" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public."flmmkr-plugins-donations";
CREATE POLICY deny_all_client_access ON public."flmmkr-plugins-donations" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public."flmmkr-plugins-donations" FROM anon, authenticated;
