-- Fase 7 (segurança): honeypot sem banimento permanente. Todo bloqueio passa a ter validade.
ALTER TABLE public.blocked_attackers ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Bloqueios antigos eram permanentes (e podiam pegar visitante legítimo por um único GET): liberados.
UPDATE public.blocked_attackers SET is_banned = false WHERE expires_at IS NULL AND is_banned = true;

CREATE INDEX IF NOT EXISTS idx_blocked_attackers_active ON public.blocked_attackers (ip_address, expires_at) WHERE is_banned = true;
