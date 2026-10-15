import 'server-only';

/**
 * Vídeos (Panda) de cada aula. SOMENTE SERVIDOR: os IDs não podem ir para o código do navegador.
 * (A lista de aulas com vídeo para o navegador fica em config/lessonsWithVideo.ts.)
 *
 * Vídeos (Panda) de cada aula. Fonte única usada pelo player e pela rota /api/content/panda-info.
 * Para adicionar um vídeo: inclua o ID (o trecho depois de `?v=` no embed) na aula certa.
 * Aula com 2+ vídeos mostra a lista "Aulas do módulo"; com 1 vídeo mostra só o player.
 */
export interface LessonVideoSeed {
  id: string;
  title: string;
  partLabel?: string;
  /** Duração conhecida em segundos (a API do Panda confirma depois). */
  duration?: number;
  /** Legenda padrão do embed, quando o vídeo tiver. */
  defaultSubtitle?: string;
}

export const PANDA_LIBRARY = 'vz-5bb7b1c1-d28';

export const LESSON_VIDEOS: Record<string, LessonVideoSeed[]> = {
  'mod1-1': [
    { id: 'dcc5a135-2d08-4589-b0f1-caff163a7cf5', title: 'Introdução ao DaVinci Resolve', partLabel: 'Parte 01', duration: 330 },
    { id: 'd792f957-2169-4efe-9b64-bc27a16bdb39', title: 'Introdução ao DaVinci Resolve', partLabel: 'Parte 02', duration: 789 },
  ],
  'mod1-analise-tecnica': [
    { id: 'c9f6f93e-36fb-46c0-a414-d2387c356809', title: 'Análise Técnica — Profundidade de bits' },
  ],
  'mod1-2': [
    { id: 'daedd222-f8da-4bf6-8a22-2c94904c6ed3', title: 'Gerenciamento de Cores', partLabel: 'Parte 01', defaultSubtitle: 'pt-BR' },
    { id: '31660bf7-6714-4d63-83bc-bc2624b97db7', title: 'Gerenciamento de Cores', partLabel: 'Parte 02' },
  ],
  'mod1-dicas': [
    { id: '322a76fb-62bf-456c-a605-577de2e64556', title: 'Dicas' },
  ],
  'mod2-1': [
    { id: '38db0a7a-34df-4fb7-bbcc-3ee9aeaf01ed', title: 'Primárias' },
  ],
  'mod1-4': [
    { id: '8722e60a-944d-49e3-bb21-d45c6a50297b', title: 'Fluxo de Trabalho' },
  ],
};

export const pandaEmbedUrl = (id: string) =>
  `https://player-${PANDA_LIBRARY}.tv.pandavideo.com.br/embed/?v=${id}`;

export const pandaThumbnailUrl = (id: string) =>
  `https://cdn.pandavideo.com/${PANDA_LIBRARY}/${id}/thumbnail.jpg`;

/** Procura o vídeo (e a aula) pelo ID. */
export function findLessonVideo(videoId: string): LessonVideoSeed | undefined {
  for (const list of Object.values(LESSON_VIDEOS)) {
    const hit = list.find((v) => v.id === videoId);
    if (hit) return hit;
  }
  return undefined;
}

if (process.env.NODE_ENV !== 'production') {
  // Garante que lessonsWithVideo.ts (navegador) e este arquivo (servidor) listam as mesmas aulas.
  import('./lessonsWithVideo').then(({ LESSONS_WITH_VIDEO }) => {
    const server = Object.keys(LESSON_VIDEOS).sort().join(',');
    const client = [...LESSONS_WITH_VIDEO].sort().join(',');
    if (server !== client) console.warn('[lessonVideos] config/lessonsWithVideo.ts está diferente das aulas com vídeo:', { server, client });
  });
}
