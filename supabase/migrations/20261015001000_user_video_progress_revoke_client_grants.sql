-- A tabela é lida e gravada só pela API (service_role). Tira os privilégios que o Supabase dá por padrão ao navegador.
REVOKE ALL ON TABLE public.user_video_progress FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_video_progress TO service_role;
