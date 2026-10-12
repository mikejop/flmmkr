-- Rate limits are keyed by a server-side HMAC of the trusted client IP.
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  rate_key TEXT PRIMARY KEY,
  window_started_at TIMESTAMPTZ NOT NULL,
  request_count INTEGER NOT NULL CHECK (request_count > 0),
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.api_rate_limits TO service_role;

CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(
  p_key TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_count INTEGER;
  v_now TIMESTAMPTZ := pg_catalog.clock_timestamp();
BEGIN
  IF p_key IS NULL OR p_key !~ '^[a-f0-9]{64}$'
    OR p_max_requests < 1 OR p_max_requests > 10000
    OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.api_rate_limits AS current_window
    (rate_key, window_started_at, request_count, expires_at)
  VALUES (p_key, v_now, 1, v_now + pg_catalog.make_interval(secs => p_window_seconds))
  ON CONFLICT (rate_key) DO UPDATE SET
    window_started_at = CASE
      WHEN current_window.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= v_now THEN v_now
      ELSE current_window.window_started_at
    END,
    request_count = CASE
      WHEN current_window.window_started_at + pg_catalog.make_interval(secs => p_window_seconds) <= v_now THEN 1
      ELSE current_window.request_count + 1
    END,
    expires_at = v_now + pg_catalog.make_interval(secs => p_window_seconds)
  RETURNING request_count INTO v_count;

  RETURN v_count <= p_max_requests;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.consume_api_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_api_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- A restrictive policy blocks client access to members-private while remaining
-- neutral for other buckets, including site-public.
DROP POLICY IF EXISTS deny_all_client_access_members_private ON storage.objects;
CREATE POLICY deny_all_client_access_members_private
  ON storage.objects AS RESTRICTIVE
  FOR ALL TO anon, authenticated
  USING (bucket_id <> 'members-private')
  WITH CHECK (bucket_id <> 'members-private');
