-- Fase 5 (segurança): comentários e perfil. Limites de tamanho no banco (espelham o zod da API)
-- e políticas de comentários que exigem acesso ativo. As constraints entram como NOT VALID:
-- valem para toda linha nova; dá para validar as antigas depois com ALTER TABLE ... VALIDATE CONSTRAINT.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_comments_content_len') THEN
    ALTER TABLE public.lesson_comments ADD CONSTRAINT lesson_comments_content_len
      CHECK (char_length(content) BETWEEN 1 AND 2000) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_comments_ids_len') THEN
    ALTER TABLE public.lesson_comments ADD CONSTRAINT lesson_comments_ids_len
      CHECK (char_length(lesson_id) <= 64 AND (module_id IS NULL OR char_length(module_id) <= 64)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lesson_comments_user_name_len') THEN
    ALTER TABLE public.lesson_comments ADD CONSTRAINT lesson_comments_user_name_len
      CHECK (char_length(user_name) <= 200) NOT VALID;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_names_len') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_names_len
      CHECK ((first_name IS NULL OR char_length(first_name) <= 80)
         AND (last_name IS NULL OR char_length(last_name) <= 80)
         AND (full_name IS NULL OR char_length(full_name) <= 170)) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_phone_len') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_len
      CHECK (phone IS NULL OR char_length(phone) <= 30) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_nickname_len') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_nickname_len
      CHECK (nickname IS NULL OR char_length(nickname) <= 40) NOT VALID;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_avatar_url_len') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_avatar_url_len
      CHECK (avatar_url IS NULL OR char_length(avatar_url) <= 500) NOT VALID;
  END IF;
  -- Biografia (se a coluna existir): no máximo 500 caracteres.
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'bio')
     AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_bio_len') THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_bio_len CHECK (bio IS NULL OR char_length(bio) <= 500) NOT VALID;
  END IF;
END $$;

-- Comentários: ler e publicar só com acesso ativo (pagamento confirmado ou administrador), também na política.
-- O acesso do navegador à tabela continua fechado (sem GRANT); a API usa a service_role.
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON public.lesson_comments;
CREATE POLICY "Active students can insert own comments"
  ON public.lesson_comments FOR INSERT TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND (p.role = 'admin' OR (p.has_access = true AND p.payment_status = 'CONFIRMED'))
    )
  );

DROP POLICY IF EXISTS "Public comments are viewable by authenticated users" ON public.lesson_comments;
CREATE POLICY "Active students can view public comments"
  ON public.lesson_comments FOR SELECT TO authenticated
  USING (
    (is_public = true OR user_id = (SELECT auth.uid()))
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (SELECT auth.uid())
        AND (p.role = 'admin' OR (p.has_access = true AND p.payment_status = 'CONFIRMED'))
    )
  );

REVOKE ALL ON TABLE public.lesson_comments FROM anon, authenticated;
