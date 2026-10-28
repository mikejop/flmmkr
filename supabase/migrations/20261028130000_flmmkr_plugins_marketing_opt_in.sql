-- Consentimento (LGPD) para receber notificações e e-mail marketing da FLMMKR, escolhido no cadastro de download
-- e no modal de doação. Padrão: não recebe. Guarda quando o consentimento foi dado.

ALTER TABLE public."flmmkr-plugins"
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ;

ALTER TABLE public."flmmkr-plugins-donations"
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_opt_in_at TIMESTAMPTZ;
