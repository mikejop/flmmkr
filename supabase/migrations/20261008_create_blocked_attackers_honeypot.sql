-- Migration: Honeypot Protection and Permanent Attacker Blocking
-- Description: Tabela para registro e bloqueio indefinido de IPs e MACs que acessam honeypots

CREATE TABLE IF NOT EXISTS public.blocked_attackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  device_fingerprint TEXT,
  honeypot_triggered TEXT NOT NULL,
  user_agent TEXT,
  request_headers JSONB,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  is_banned BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_blocked_attackers_ip ON public.blocked_attackers(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_attackers_mac ON public.blocked_attackers(mac_address);
CREATE INDEX IF NOT EXISTS idx_blocked_attackers_fp ON public.blocked_attackers(device_fingerprint);

ALTER TABLE public.blocked_attackers ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.blocked_attackers FROM anon, authenticated;
