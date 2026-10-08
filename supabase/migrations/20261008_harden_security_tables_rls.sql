-- Migration: Harden Internal Security Tables
-- Description: Ativa RLS e revoga acessos da anon key nas tabelas de tracking e auditoria

ALTER TABLE public.login_security_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.login_security_tracking FROM anon, authenticated;
REVOKE ALL ON public.user_active_sessions FROM anon, authenticated;
REVOKE ALL ON public.security_audit_logs FROM anon, authenticated;
