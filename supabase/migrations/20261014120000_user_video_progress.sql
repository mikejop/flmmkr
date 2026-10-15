-- Progresso e uso do player de vídeo (1 linha por aluno e vídeo).
-- Gravado só pela API (service_role); o navegador não acessa a tabela direto.
CREATE TABLE IF NOT EXISTS public.user_video_progress (
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id        TEXT        NOT NULL,
  lesson_id       TEXT        NOT NULL,
  position        INTEGER     NOT NULL DEFAULT 0 CHECK (position >= 0),      -- onde parou (s)
  max_position    INTEGER     NOT NULL DEFAULT 0 CHECK (max_position >= 0),  -- ponto mais distante alcançado (s)
  duration        INTEGER     NOT NULL DEFAULT 0 CHECK (duration >= 0),
  watched_seconds INTEGER     NOT NULL DEFAULT 0 CHECK (watched_seconds >= 0), -- segundos distintos assistidos
  ranges          JSONB       NOT NULL DEFAULT '[]'::jsonb,                   -- trechos assistidos [[ini,fim],...]
  stats           JSONB       NOT NULL DEFAULT '{}'::jsonb,                   -- plays, pauses, seeks, fullscreen, captions, sessions, watchSecs, speed
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, video_id)
);
CREATE INDEX IF NOT EXISTS idx_user_video_progress_lesson ON public.user_video_progress (user_id, lesson_id);

ALTER TABLE public.user_video_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_all_client_access
  ON public.user_video_progress FOR ALL TO anon, authenticated
  USING (false)
  WITH CHECK (false);
