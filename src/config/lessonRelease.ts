/**
 * Liberação das aulas por data e hora. Todas as datas estão no horário de Brasília (UTC-3, sem horário de verão).
 * Aula que não aparece aqui está liberada desde o começo.
 */

/** Bloqueada sem data de liberação: a aula fica fechada até alguém trocar por uma data. */
const NO_DATE = Number.POSITIVE_INFINITY;

// Livres: tudo até Primárias. O resto fica bloqueado, sem data (31/10/2026).
const LESSON_RELEASE_AT: Record<string, number> = {
  'mod2-2': NO_DATE, // Shot Matching
  'mod2-3': NO_DATE, // Secundárias
  'mod3-1': NO_DATE, // Criando Look sem Plugins
  'mod3-2': NO_DATE, // Film Look Creator
  'mod3-3': NO_DATE, // Dehancer Pro
  'mod4-1': NO_DATE, // Bônus 1
  'mod4-2': NO_DATE, // Bônus 2
  'mod4-3': NO_DATE, // Bônus 3
};

/** Momento da liberação (ms desde 1970), ou null se a aula já nasce liberada. Infinity = bloqueada sem data. */
export function getLessonReleaseAt(lessonId: string): number | null {
  return Object.hasOwn(LESSON_RELEASE_AT, lessonId) ? LESSON_RELEASE_AT[lessonId] : null;
}

/** Próximo momento de liberação depois de `now`, para o site se atualizar sozinho quando a hora chegar. */
export function getNextReleaseAfter(now: number): number | null {
  const all = Object.values(LESSON_RELEASE_AT).filter((t) => t > now && Number.isFinite(t));
  return all.length ? Math.min(...all) : null;
}

export function formatReleaseDate(ms: number): string {
  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(ms));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const minutes = get('minute') === '00' ? '' : `:${get('minute')}`;
  return `${get('day')}/${get('month')}/${get('year')} às ${get('hour')}h${minutes} (horário de Brasília)`;
}
