-- Migration: User Activation Tokens and Payment Verification Dual Check
-- Description: Token com sufixo exclusivo para primeiro acesso e tracking de status de pagamento Asaas

CREATE TABLE IF NOT EXISTS public.user_activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON public.user_activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_email ON public.user_activation_tokens(email);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'CONFIRMED';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_suffix TEXT;

-- RLS
ALTER TABLE public.user_activation_tokens ENABLE ROW LEVEL SECURITY;
-- Por padrão apenas a service_role do servidor tem permissão de leitura/escrita
