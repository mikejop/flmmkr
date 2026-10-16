-- Minha Conta: reembolso em 7 dias, exclusão de conta, auditoria e preferências de notificação.
-- Tudo é escrito só pela service role (rotas de servidor). O aluno lê apenas as próprias linhas.

-- 1) Reembolsos --------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- anulável: o registro financeiro sobrevive à exclusão da conta
  asaas_payment_id TEXT NOT NULL UNIQUE,
  asaas_installment_id TEXT,
  billing_type TEXT NOT NULL CHECK (billing_type IN ('CREDIT_CARD', 'PIX', 'BOLETO')),
  amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'manual_review')),
  reason TEXT CHECK (reason IS NULL OR char_length(reason) <= 500),
  error TEXT CHECK (error IS NULL OR char_length(error) <= 1000),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  with_account_deletion BOOLEAN NOT NULL DEFAULT false,
  -- Apoio às regras (não são dados exibidos): hash do CPF e chave do produto, para o limite de 1 reembolso por CPF e produto.
  cpf_hash TEXT CHECK (cpf_hash IS NULL OR char_length(cpf_hash) <= 128),
  product_key TEXT CHECK (product_key IS NULL OR char_length(product_key) <= 64),
  -- Boleto: link em que o pagador informa os dados bancários para receber.
  bank_slip_refund_url TEXT CHECK (bank_slip_refund_url IS NULL OR char_length(bank_slip_refund_url) <= 500)
);
CREATE INDEX IF NOT EXISTS idx_refund_requests_user ON public.refund_requests (user_id, requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_refund_requests_cpf_product ON public.refund_requests (cpf_hash, product_key) WHERE status = 'completed';
CREATE INDEX IF NOT EXISTS idx_refund_requests_status ON public.refund_requests (status);

ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read own refund requests" ON public.refund_requests;
CREATE POLICY "Students read own refund requests" ON public.refund_requests FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON TABLE public.refund_requests FROM anon, authenticated;
GRANT SELECT ON TABLE public.refund_requests TO authenticated;

-- 2) Exclusões de conta ------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.account_deletions (
  user_id UUID PRIMARY KEY,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'cancelled', 'completed')),
  with_refund BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS idx_account_deletions_due ON public.account_deletions (scheduled_for) WHERE status = 'scheduled';

ALTER TABLE public.account_deletions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read own account deletion" ON public.account_deletions;
CREATE POLICY "Students read own account deletion" ON public.account_deletions FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
REVOKE ALL ON TABLE public.account_deletions FROM anon, authenticated;
GRANT SELECT ON TABLE public.account_deletions TO authenticated;

-- 3) Auditoria (só a service role escreve; ninguém lê pelo cliente) -----------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  action TEXT NOT NULL CHECK (char_length(action) <= 80),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_hash TEXT CHECK (ip_hash IS NULL OR char_length(ip_hash) <= 128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_created ON public.audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action_created ON public.audit_log (action, created_at DESC);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS deny_all_client_access ON public.audit_log;
CREATE POLICY deny_all_client_access ON public.audit_log FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
REVOKE ALL ON TABLE public.audit_log FROM anon, authenticated;

-- 4) Preferências de notificação ---------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_new_lessons BOOLEAN NOT NULL DEFAULT true,
  email_comment_replies BOOLEAN NOT NULL DEFAULT true,
  email_mentions BOOLEAN NOT NULL DEFAULT true,
  email_marketing BOOLEAN NOT NULL DEFAULT false,
  whatsapp_new_lessons BOOLEAN NOT NULL DEFAULT true,
  whatsapp_marketing BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students read own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Students insert own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Students update own preferences" ON public.notification_preferences;
CREATE POLICY "Students read own preferences" ON public.notification_preferences FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));
CREATE POLICY "Students insert own preferences" ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));
CREATE POLICY "Students update own preferences" ON public.notification_preferences FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));
REVOKE ALL ON TABLE public.notification_preferences FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.notification_preferences TO authenticated;

-- 5) Perfis -------------------------------------------------------------------------------------------------------------
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deletion_status TEXT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_deletion_status_check') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_deletion_status_check
      CHECK (deletion_status IS NULL OR deletion_status IN ('scheduled', 'pending_refund', 'completed'));
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_profiles_deletion_status ON public.profiles (deletion_status) WHERE deletion_status IS NOT NULL;
