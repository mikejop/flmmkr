-- Analytics events are written through trusted backend routes only.
-- Explicitly deny browser roles while preserving service_role's bypass.
CREATE POLICY deny_all_client_access
  ON public.site_traffic_analytics FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);
