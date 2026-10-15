/**
 * Progresso de vídeo: tipos e regras de mesclagem, compartilhados entre o navegador e a API.
 * Tudo é idempotente (mesclar duas vezes dá o mesmo resultado), então reenviar após falha de rede é seguro.
 */

export type Range = [number, number]; // trecho assistido, em segundos inteiros [início, fim]

export interface VideoStats {
  plays: number;       // vezes que deu play
  pauses: number;
  seeks: number;       // vezes que mexeu na linha do tempo
  fullscreen: number;
  captions: number;    // vezes que ligou/desligou legenda
  sessions: number;    // vezes que abriu o vídeo
  watchSecs: number;   // tempo realmente assistido (já corrigido pela velocidade)
  speed: number;       // última velocidade usada
}

export interface VideoProgress {
  videoId: string;
  lessonId: string;
  position: number;     // onde parou (s)
  maxPosition: number;  // ponto mais distante alcançado (s)
  duration: number;     // duração conhecida (s)
  ranges: Range[];      // trechos assistidos, já unidos
  stats: VideoStats;
  completed: boolean;
  updatedAt: number;    // ms
}

export const MAX_RANGES = 120;
export const COMPLETE_RATIO = 0.95;

export const emptyStats = (): VideoStats => ({ plays: 0, pauses: 0, seeks: 0, fullscreen: 0, captions: 0, sessions: 0, watchSecs: 0, speed: 1 });

export const emptyProgress = (videoId: string, lessonId: string): VideoProgress => ({
  videoId, lessonId, position: 0, maxPosition: 0, duration: 0, ranges: [], stats: emptyStats(), completed: false, updatedAt: 0,
});

const num = (v: unknown, max: number): number => {
  const n = typeof v === 'number' && Number.isFinite(v) ? v : 0;
  return Math.min(Math.max(n, 0), max);
};

/** Une trechos que se tocam (ou ficam a ≤1 s de distância) e limita a quantidade guardada. */
export function mergeRanges(list: Range[]): Range[] {
  const sorted = list
    .filter((r) => Array.isArray(r) && r.length === 2 && Number.isFinite(r[0]) && Number.isFinite(r[1]) && r[1] >= r[0])
    .map((r): Range => [Math.floor(r[0]), Math.ceil(r[1])])
    .sort((a, b) => a[0] - b[0]);
  let gap = 1;
  let out: Range[] = [];
  for (;;) {
    out = [];
    for (const r of sorted) {
      const last = out[out.length - 1];
      if (last && r[0] <= last[1] + gap) last[1] = Math.max(last[1], r[1]);
      else out.push([r[0], r[1]]);
    }
    if (out.length <= MAX_RANGES) return out;
    gap *= 2; // passou do limite: fecha buracos cada vez maiores (perde pouco, nunca estoura)
  }
}

export const sumRanges = (ranges: Range[]): number => ranges.reduce((s, r) => s + (r[1] - r[0]), 0);

/** Valida e limita qualquer coisa vinda de fora (localStorage ou corpo da requisição). */
export function sanitizeProgress(input: unknown): VideoProgress | null {
  if (!input || typeof input !== 'object') return null;
  const i = input as Record<string, unknown>;
  if (typeof i.videoId !== 'string' || typeof i.lessonId !== 'string') return null;
  const st = (i.stats && typeof i.stats === 'object' ? i.stats : {}) as Record<string, unknown>;
  const duration = num(i.duration, 86400);
  const cap = duration || 86400;
  const rangesIn = Array.isArray(i.ranges) ? (i.ranges.slice(0, 2000) as Range[]) : [];
  const ranges = mergeRanges(rangesIn.map((r): Range => [num(r?.[0], cap), num(r?.[1], cap)]));
  return {
    videoId: i.videoId.slice(0, 64),
    lessonId: i.lessonId.slice(0, 64),
    position: num(i.position, cap),
    maxPosition: num(i.maxPosition, cap),
    duration,
    ranges,
    stats: {
      plays: num(st.plays, 1e6), pauses: num(st.pauses, 1e6), seeks: num(st.seeks, 1e6),
      fullscreen: num(st.fullscreen, 1e6), captions: num(st.captions, 1e6), sessions: num(st.sessions, 1e6),
      watchSecs: num(st.watchSecs, 1e8), speed: Math.min(Math.max(num(st.speed, 4) || 1, 0.25), 4),
    },
    completed: i.completed === true,
    updatedAt: num(i.updatedAt, 8.64e15),
  };
}

/** Junta dois registros do mesmo vídeo sem perder nada: contadores e trechos só crescem; a posição é a mais recente. */
export function mergeProgress(a: VideoProgress | undefined, b: VideoProgress): VideoProgress {
  if (!a) return b;
  const newer = b.updatedAt >= a.updatedAt ? b : a;
  const stats = { ...newer.stats };
  (Object.keys(stats) as (keyof VideoStats)[]).forEach((k) => {
    if (k !== 'speed') stats[k] = Math.max(a.stats[k], b.stats[k]);
  });
  return {
    videoId: b.videoId,
    lessonId: newer.lessonId,
    position: newer.position,
    maxPosition: Math.max(a.maxPosition, b.maxPosition),
    duration: Math.max(a.duration, b.duration),
    ranges: mergeRanges([...a.ranges, ...b.ranges]),
    stats,
    completed: a.completed || b.completed,
    updatedAt: Math.max(a.updatedAt, b.updatedAt),
  };
}

/** Posição para retomar: não retoma no começo (<10 s) nem no fim (vídeo concluído volta ao início). */
export function resumePosition(p: VideoProgress | undefined, duration?: number): number {
  if (!p) return 0;
  const dur = duration || p.duration;
  if (p.position < 10) return 0;
  if (dur && (p.position >= dur - 10 || (p.completed && p.position >= dur * COMPLETE_RATIO))) return 0;
  return Math.floor(p.position);
}
