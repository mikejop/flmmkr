-- Desempenho (B7): índices para filtros e RLS frequentes + políticas RLS com (select auth.uid()).
-- Não altera a lógica de nenhuma política: só embrulha auth.uid() num sub-select, que o Postgres avalia 1 vez por consulta
-- em vez de 1 vez por linha. Idempotente: pode rodar de novo sem efeito.

-- 1) Índices (só em colunas usadas por filtros do código e por políticas) ------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_lesson_comments_parent ON public.lesson_comments (parent_id) WHERE parent_id IS NOT NULL;
-- "liked_by_me": consulta liked_by @> {usuário} limitada aos IDs da página
CREATE INDEX IF NOT EXISTS idx_lesson_comments_liked_by ON public.lesson_comments USING gin (liked_by);
CREATE INDEX IF NOT EXISTS idx_pending_checkouts_email_created ON public.pending_checkouts (email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_notifications_unread ON public.user_notifications (user_id, created_at DESC) WHERE is_read = false;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'email') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'asaas_payment_id') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_asaas_payment_id ON public.profiles (asaas_payment_id) WHERE asaas_payment_id IS NOT NULL;
  END IF;
END $$;

-- 2) Políticas: auth.uid() -> (select auth.uid()), preservando comando, papéis e o resto da expressão ----------------------
DO $$
DECLARE
  pol RECORD;
  wrapped CONSTANT text := '( SELECT auth.uid() AS uid)'; -- como o Postgres exibe um auth.uid() já embrulhado
  new_qual text;
  new_check text;
  stmt text;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname, qual, with_check
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
      AND (
        replace(coalesce(qual, ''), wrapped, '') ~ 'auth\.uid\(\)'
        OR replace(coalesce(with_check, ''), wrapped, '') ~ 'auth\.uid\(\)'
      )
  LOOP
    new_qual := CASE WHEN pol.qual IS NULL THEN NULL ELSE
      replace(regexp_replace(replace(pol.qual, wrapped, '@@W@@'), 'auth\.uid\(\)', '(select auth.uid())', 'g'), '@@W@@', '(select auth.uid())') END;
    new_check := CASE WHEN pol.with_check IS NULL THEN NULL ELSE
      replace(regexp_replace(replace(pol.with_check, wrapped, '@@W@@'), 'auth\.uid\(\)', '(select auth.uid())', 'g'), '@@W@@', '(select auth.uid())') END;

    stmt := format('ALTER POLICY %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
    IF new_qual IS NOT NULL THEN stmt := stmt || format(' USING (%s)', new_qual); END IF;
    IF new_check IS NOT NULL THEN stmt := stmt || format(' WITH CHECK (%s)', new_check); END IF;

    RAISE NOTICE 'RLS: reescrevendo % em %.%', pol.policyname, pol.schemaname, pol.tablename;
    EXECUTE stmt;
  END LOOP;
END $$;
