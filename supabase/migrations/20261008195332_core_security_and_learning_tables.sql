-- Tables already consumed by server code, with explicit RLS and no browser access.

CREATE TABLE IF NOT EXISTS public.user_active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_name TEXT,
  ip_address TEXT,
  location TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  replaced_by_device TEXT,
  replaced_by_location TEXT,
  replaced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_heartbeat_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_active_sessions_user_created ON public.user_active_sessions(user_id, created_at DESC);
WITH ranked AS (
  SELECT id, row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC) AS position
  FROM public.user_active_sessions WHERE is_active
)
UPDATE public.user_active_sessions AS sessions
SET is_active = false
FROM ranked
WHERE sessions.id = ranked.id AND ranked.position > 1;
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_active_sessions_one_active ON public.user_active_sessions(user_id) WHERE is_active;

CREATE TABLE IF NOT EXISTS public.login_security_tracking (
  email TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  escalation_level INTEGER NOT NULL DEFAULT 0 CHECK (escalation_level >= 0),
  locked_until TIMESTAMPTZ,
  last_failed_at TIMESTAMPTZ,
  last_ip TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  ip_address INET,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created ON public.security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user ON public.security_audit_logs(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.user_reading_state (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL DEFAULT 'legacy-youtuber-pro',
  last_module_id TEXT NOT NULL DEFAULT 'mod1',
  last_lesson_id TEXT NOT NULL DEFAULT 'mod1-1',
  last_subtab_id TEXT,
  last_tab TEXT NOT NULL DEFAULT 'teoria',
  scroll_top INTEGER NOT NULL DEFAULT 0 CHECK (scroll_top >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_reading_state ADD COLUMN IF NOT EXISTS course_id TEXT NOT NULL DEFAULT 'legacy-youtuber-pro';
ALTER TABLE public.user_reading_state DROP CONSTRAINT IF EXISTS user_reading_state_pkey;
ALTER TABLE public.user_reading_state DROP CONSTRAINT IF EXISTS user_reading_state_user_id_key;
ALTER TABLE public.user_reading_state ADD CONSTRAINT user_reading_state_pkey PRIMARY KEY (user_id, course_id);

CREATE TABLE IF NOT EXISTS public.user_highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL DEFAULT 'legacy-youtuber-pro',
  lesson_id TEXT NOT NULL,
  section_title TEXT NOT NULL DEFAULT '',
  text_content TEXT NOT NULL,
  prefix TEXT NOT NULL DEFAULT '',
  suffix TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT 'yellow',
  note TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.user_highlights ADD COLUMN IF NOT EXISTS course_id TEXT NOT NULL DEFAULT 'legacy-youtuber-pro';
CREATE INDEX IF NOT EXISTS idx_user_highlights_user_course_lesson ON public.user_highlights(user_id, course_id, lesson_id, created_at);

CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL DEFAULT '',
  lesson_id TEXT,
  module_id TEXT,
  comment_id UUID,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_name TEXT,
  sender_avatar TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user_created ON public.user_notifications(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id TEXT NOT NULL,
  module_id TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  parent_id UUID REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT true,
  likes_count INTEGER NOT NULL DEFAULT 0 CHECK (likes_count >= 0),
  liked_by UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_lesson_created ON public.lesson_comments(lesson_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_lesson_comments_user ON public.lesson_comments(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.site_traffic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  device_fingerprint TEXT,
  ip INET,
  country TEXT,
  region TEXT,
  city TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  device_type TEXT,
  os TEXT,
  browser TEXT,
  traffic_category TEXT,
  source_name TEXT,
  referrer_url TEXT,
  landing_path TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  screen_resolution TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_site_traffic_analytics_created ON public.site_traffic_analytics(created_at DESC);

-- Asaas event/payment identifiers prevent duplicate provisioning when the provider retries.
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'asaas',
  provider_event_id TEXT NOT NULL UNIQUE,
  provider_payment_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processing_status TEXT NOT NULL DEFAULT 'received' CHECK (processing_status IN ('received', 'processing', 'processed', 'failed')),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_error TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON public.payment_events(provider_payment_id, received_at DESC);

ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS traffic_source TEXT;
ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS device_fingerprint TEXT;
ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS ip TEXT;
ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS utm_source TEXT;
ALTER TABLE public.pending_checkouts ADD COLUMN IF NOT EXISTS referrer TEXT;

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'student';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS has_access BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'CONFIRMED';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS access_suffix TEXT;
UPDATE public.profiles SET access_suffix = NULL WHERE access_suffix IS NOT NULL;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('student', 'admin'));

CREATE TABLE IF NOT EXISTS public.payment_check_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  asaas_payment_id TEXT,
  status TEXT,
  reason TEXT,
  response JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payment_check_logs_created ON public.payment_check_logs(created_at DESC);

-- These tables also have later historical migrations. Creating them here is safe because
-- the original migrations use IF NOT EXISTS, and it lets the later RLS migration run cleanly.
CREATE TABLE IF NOT EXISTS public.user_activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  used BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON public.user_activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_email ON public.user_activation_tokens(email);

CREATE TABLE IF NOT EXISTS public.blocked_attackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL,
  mac_address TEXT,
  device_fingerprint TEXT,
  honeypot_triggered TEXT NOT NULL,
  user_agent TEXT,
  request_headers JSONB,
  banned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_banned BOOLEAN NOT NULL DEFAULT true,
  notes TEXT
);
CREATE INDEX IF NOT EXISTS idx_blocked_attackers_ip ON public.blocked_attackers(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_attackers_mac ON public.blocked_attackers(mac_address);
CREATE INDEX IF NOT EXISTS idx_blocked_attackers_fp ON public.blocked_attackers(device_fingerprint);

-- Keep browser roles out of operational and personal data; API routes use server credentials.
DO $$
DECLARE table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'user_active_sessions', 'login_security_tracking', 'security_audit_logs',
    'user_reading_state', 'user_highlights', 'user_notifications', 'lesson_comments',
    'site_traffic_analytics', 'payment_events', 'payment_check_logs', 'pending_checkouts',
    'checkout_abandonment_leads', 'offer_timer_sessions', 'user_activation_tokens',
    'member_bg_video_sessions', 'blocked_attackers'
  ] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', table_name);
    EXECUTE format('GRANT ALL ON TABLE public.%I TO service_role', table_name);
  END LOOP;
END $$;

-- These two learner-state tables are written directly by the signed-in browser client.
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_reading_state, public.user_highlights TO authenticated;
DROP POLICY IF EXISTS "Users can manage their own reading state" ON public.user_reading_state;
DROP POLICY IF EXISTS "Users can manage their own highlights" ON public.user_highlights;
CREATE POLICY "Users manage own reading state"
  ON public.user_reading_state FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users manage own highlights"
  ON public.user_highlights FOR ALL TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Profiles contain payment and authorization fields. The browser may read its own row,
-- but only trusted server code may change any profile column.
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = id);
REVOKE UPDATE, INSERT, DELETE ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
