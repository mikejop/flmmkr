-- Cadastros de quem baixa os plugins FLMMKR para DaVinci Resolve (/plugins). Tabela própria, separada do resto do sistema.
-- Só a service role (rota /api/plugins/lead) lê e grava: o navegador não tem acesso nenhum.

CREATE TABLE IF NOT EXISTS public."flmmkr-plugins" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (char_length(first_name) BETWEEN 1 AND 60),
  last_name TEXT NOT NULL CHECK (char_length(last_name) BETWEEN 1 AND 80),
  email TEXT NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 5 AND 254 AND email = lower(btrim(email))),
  -- Sistema escolhido no último download
  os TEXT CHECK (os IS NULL OR os IN ('macos', 'windows', 'linux')),
  -- HMAC do IP (nunca o IP em claro); pode ser nulo
  ip_hash TEXT CHECK (ip_hash IS NULL OR char_length(ip_hash) = 64),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "idx_flmmkr-plugins_created" ON public."flmmkr-plugins" (created_at DESC);

ALTER TABLE public."flmmkr-plugins" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public."flmmkr-plugins";
CREATE POLICY deny_all_client_access ON public."flmmkr-plugins" FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public."flmmkr-plugins" FROM anon, authenticated;
