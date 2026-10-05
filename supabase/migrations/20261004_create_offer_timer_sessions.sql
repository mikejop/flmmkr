-- Migration: Create offer_timer_sessions table
-- Description: Armazena o cronômetro promocional com prioridade no MAC address (impressão digital do computador), fallback por IP e cooldown de 36 horas.

CREATE TABLE IF NOT EXISTS public.offer_timer_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT NOT NULL,
  ip TEXT NOT NULL,
  client_identifier TEXT UNIQUE NOT NULL,
  user_agent TEXT,
  first_access_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  expires_at TIMESTAMPTZ NOT NULL,
  cooldown_until TIMESTAMPTZ NOT NULL,
  is_expired BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_offer_timer_mac ON public.offer_timer_sessions(mac_address);
CREATE INDEX IF NOT EXISTS idx_offer_timer_ip ON public.offer_timer_sessions(ip);
CREATE INDEX IF NOT EXISTS idx_offer_timer_client_id ON public.offer_timer_sessions(client_identifier);

ALTER TABLE public.offer_timer_sessions ENABLE ROW LEVEL SECURITY;

-- Proteção de Segurança: Somente o backend (service_role) acessa e atualiza as sessões do cronômetro.
-- O cliente anônimo não tem permissão direta de SELECT/UPDATE para evitar adulteração de preços.
