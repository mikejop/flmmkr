-- Migration: Harden Internal Security Tables
-- Description: Ativa RLS e revoga acessos da anon key nas tabelas de tracking e auditoria

DO $$
BEGIN
  -- These tables are created in the follow-up core migration. Keep fresh database resets
  -- working while still hardening them here when they already exist.
  IF to_regclass('public.login_security_tracking') IS NOT NULL THEN
    ALTER TABLE public.login_security_tracking ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.login_security_tracking FROM anon, authenticated;
  END IF;
  IF to_regclass('public.user_active_sessions') IS NOT NULL THEN
    ALTER TABLE public.user_active_sessions ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.user_active_sessions FROM anon, authenticated;
  END IF;
  IF to_regclass('public.security_audit_logs') IS NOT NULL THEN
    ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON public.security_audit_logs FROM anon, authenticated;
  END IF;
END $$;
