-- Migration: Create member_bg_video_sessions table
-- Description: Armazena o timestamp de quando o vídeo de background da área de membros terminou para cada usuário (MAC/IP/userId), permitindo congelar no último frame e resetar apenas após 72 horas.

CREATE TABLE IF NOT EXISTS public.member_bg_video_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mac_address TEXT NOT NULL,
  ip TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_identifier TEXT UNIQUE NOT NULL,
  finished_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_member_bg_video_mac ON public.member_bg_video_sessions(mac_address);
CREATE INDEX IF NOT EXISTS idx_member_bg_video_ip ON public.member_bg_video_sessions(ip);
CREATE INDEX IF NOT EXISTS idx_member_bg_video_user_id ON public.member_bg_video_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_member_bg_video_client_id ON public.member_bg_video_sessions(client_identifier);

ALTER TABLE public.member_bg_video_sessions ENABLE ROW LEVEL SECURITY;
