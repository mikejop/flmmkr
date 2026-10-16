-- Fase 3 (segurança): webhook do Asaas e permissões.

-- Referência única do pedido PIX: o webhook compara com a da cobrança reconsultada no Asaas.
ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS external_reference TEXT;
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_external_reference ON public.pending_checkouts (external_reference);

-- O direito de acesso (profiles.has_access / payment_status) só é escrito pelo servidor (service_role).
-- O aluno só pode ler a própria linha (policy "Users can view own profile"); tira privilégios que o
-- papel authenticated não precisa (TRUNCATE ignora RLS).
REVOKE TRUNCATE, TRIGGER, REFERENCES ON TABLE public.profiles FROM authenticated, anon;
REVOKE INSERT, UPDATE, DELETE ON TABLE public.profiles FROM authenticated, anon;
