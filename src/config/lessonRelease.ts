/**
 * Liberação das aulas por data e hora. Todas as datas estão no horário de Brasília (UTC-3, sem horário de verão).
 * Aula que não aparece aqui está liberada desde o começo.
 */

/** Início da contagem: 23/10/2026 às 21h10 (horário de Brasília). Cada aula depois de Primárias libera 24h após a anterior. */
const START = new Date('2026-10-23T21:10:00-03:00').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;
const afterDays = (days: number) => START + days * DAY_MS;

const LESSON_RELEASE_AT: Record<string, number> = {
  'mod2-2': afterDays(1), // Shot Matching: +24h
  'mod2-3': afterDays(2), // Secundárias: +48h
  'mod3-1': afterDays(3), // Criando Look sem Plugins: +72h
  'mod3-2': afterDays(4), // Film Look Creator: +96h
  'mod3-3': afterDays(5), // Dehancer Pro: +120h
  'mod4-1': afterDays(6), // Bônus 1: +144h
  // Bônus 2 e 3 adiados em 72h (30/10/2026): 02/11 e 03/11 às 21h10
  'mod4-2': afterDays(7) + 3 * DAY_MS, // Bônus 2: +168h +72h
  'mod4-3': afterDays(8) + 3 * DAY_MS, // Bônus 3: +192h +72h
};

/** Momento da liberação (ms desde 1970), ou null se a aula já nasce liberada. */
export function getLessonReleaseAt(lessonId: string): number | null {
  return Object.hasOwn(LESSON_RELEASE_AT, lessonId) ? LESSON_RELEASE_AT[lessonId] : null;
}

/** Próximo momento de liberação depois de `now`, para o site se atualizar sozinho quando a hora chegar. */
export function getNextReleaseAfter(now: number): number | null {
  const all = Object.values(LESSON_RELEASE_AT).filter((t) => t > now);
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
