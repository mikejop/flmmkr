-- Makes server-only tables explicitly inaccessible to browser roles, hardens
-- the remaining exposed schema, and prepares separate public/private media buckets.

-- service_role has BYPASSRLS in this project, so FORCE RLS does not block trusted
-- server queries. FORCE also protects against accidental table-owner requests.
DO $migration$
DECLARE relation_name text;
BEGIN
  FOR relation_name IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', relation_name);
    EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', relation_name);
  END LOOP;
END
$migration$;

-- These tables contain operational, payment, authentication, or anti-abuse data.
-- Only backend code using service_role accesses them. Keep service_role's existing
-- grants and RLS bypass intact; deny anon/authenticated explicitly as defense in depth.
DO $migration$
DECLARE relation_name text;
BEGIN
  FOREACH relation_name IN ARRAY ARRAY[
    'blocked_attackers',
    'checkout_abandonment_leads',
    'login_security_tracking',
    'member_bg_video_sessions',
    'offer_timer_sessions',
    'payment_check_logs',
    'payment_events',
    'pending_checkouts',
    'security_audit_logs',
    'user_activation_tokens',
    'user_active_sessions'
  ] LOOP
    IF to_regclass(format('public.%I', relation_name)) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON TABLE public.%I FROM anon, authenticated', relation_name);
      EXECUTE format('DROP POLICY IF EXISTS deny_all_client_access ON public.%I', relation_name);
      EXECUTE format(
        'CREATE POLICY deny_all_client_access ON public.%I FOR ALL TO anon, authenticated USING (false) WITH CHECK (false)',
        relation_name
      );
    END IF;
  END LOOP;
END
$migration$;

-- Prevent anonymous profile table access. Authenticated users retain their own-row SELECT.
REVOKE ALL ON TABLE public.profiles FROM anon;
GRANT SELECT ON TABLE public.profiles TO authenticated;

-- Notifications are accessed through authenticated API routes. Limit the existing
-- self-row policies to authenticated and prevent a row's ownership being reassigned.
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.user_notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.user_notifications;
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT TO authenticated
  USING ((SELECT auth.uid()) = user_id);
CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

-- Keep auth.uid() from being reevaluated for every row in these policies.
DROP POLICY IF EXISTS "Public comments are viewable by authenticated users" ON public.lesson_comments;
CREATE POLICY "Public comments are viewable by authenticated users"
  ON public.lesson_comments FOR SELECT TO authenticated
  USING (
    is_public = true
    OR user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.lesson_comments;
CREATE POLICY "Authenticated users can insert comments"
  ON public.lesson_comments FOR INSERT TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);
DROP POLICY IF EXISTS "Users can delete own comments or admin can delete" ON public.lesson_comments;
CREATE POLICY "Users can delete own comments or admin can delete"
  ON public.lesson_comments FOR DELETE TO authenticated
  USING (
    user_id = (SELECT auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid()) AND profiles.role = 'admin'
    )
  );

-- Cover the two foreign keys flagged by Performance Advisor and remove the
-- duplicate created_at index while preserving the other identical index.
CREATE INDEX IF NOT EXISTS payment_check_logs_user_id_idx
  ON public.payment_check_logs (user_id);
CREATE INDEX IF NOT EXISTS user_activation_tokens_user_id_idx
  ON public.user_activation_tokens (user_id);
DROP INDEX IF EXISTS public.idx_site_traffic_analytics_created;

-- service_role bypasses RLS in this project, so this permissive policy is redundant.
DROP POLICY IF EXISTS "Allow service_role full access to site_traffic_analytics"
  ON public.site_traffic_analytics;

-- Browser storage writes are already performed by authenticated API routes using
-- service_role. Remove broad direct upload/update policies for the public avatars bucket.
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

-- New public assets must be images only. Member materials are private and are served
-- through short-lived signed URLs from an authenticated server route.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'site-public', 'site-public', true, 10485760,
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'members-private', 'members-private', false, 52428800,
  ARRAY[
    'application/pdf', 'application/zip', 'application/x-zip-compressed',
    'image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/avif',
    'video/webm', 'video/mp4'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Public bucket URLs intentionally allow object retrieval, but no browser policy is
-- created for listing, upload, update, or delete. Private objects have explicit denial.
DROP POLICY IF EXISTS deny_all_client_access_members_private ON storage.objects;
CREATE POLICY deny_all_client_access_members_private
  ON storage.objects FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);

-- The current migration connection does not have permission to alter default
-- privileges. Existing broad privileges below are still revoked; default
-- privileges require an owner-level Supabase migration context.

-- Also fix any existing broad sequence/function privileges in the exposed schema.
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon, authenticated;
