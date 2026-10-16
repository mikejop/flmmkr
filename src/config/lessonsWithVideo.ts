/**
 * Aulas que têm vídeo do Panda. Lista segura para o navegador: só os IDs das AULAS, nunca os dos vídeos.
 * Os IDs dos vídeos ficam em config/lessonVideos.ts (somente servidor) e só chegam ao aluno com acesso ativo,
 * por /api/content/panda-info. Ao incluir um vídeo novo, a aula precisa estar aqui também.
 */
export const LESSONS_WITH_VIDEO: ReadonlySet<string> = new Set([
  'mod1-1',
  'mod1-analise-tecnica',
  'mod1-2',
  'mod1-4',
  'mod1-dicas',
  'mod2-1',
]);

export const hasLessonVideo = (lessonId: string): boolean => LESSONS_WITH_VIDEO.has(lessonId);
