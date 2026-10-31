/**
 * Liberação das aulas por data e hora. Todas as datas estão no horário de Brasília (UTC-3, sem horário de verão).
 * Aula que não aparece aqui está liberada desde o começo.
 */

/** Início da contagem: Shot Matching libera segunda, 02/11/2026, às 12h30 (horário de Brasília). Cada aula seguinte libera 24h após a anterior. */
const START = new Date('2026-11-02T12:30:00-03:00').getTime();
const DAY_MS = 24 * 60 * 60 * 1000;
const afterDays = (days: number) => START + days * DAY_MS;

// Livres: tudo até Primárias. O resto entra em sequência (definido em 31/10/2026).
const LESSON_RELEASE_AT: Record<string, number> = {
  'mod2-2': afterDays(0), // Shot Matching: 02/11 12h30
  'mod2-3': afterDays(1), // Secundárias: +24h
  'mod3-1': afterDays(2), // Criando Look sem Plugins: +48h
  'mod3-2': afterDays(3), // Film Look Creator: +72h
  'mod3-3': afterDays(4), // Dehancer Pro: +96h
  'mod4-1': afterDays(5), // Bônus 1: +120h
  'mod4-2': afterDays(6), // Bônus 2: +144h
  'mod4-3': afterDays(7), // Bônus 3: +168h
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
  const minutes = get('minute') === '00' ? '' : get('minute');
  return `${get('day')}/${get('month')}/${get('year')} às ${get('hour')}h${minutes} (horário de Brasília)`;
}
