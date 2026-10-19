/**
 * Liberação das aulas por data e hora. Todas as datas estão no horário de Brasília (UTC-3, sem horário de verão).
 * Aula que não aparece aqui está liberada desde o começo.
 */

const at = (day: number, hour = 14) =>
  new Date(`2026-10-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:00:00-03:00`).getTime();

const LESSON_RELEASE_AT: Record<string, number> = {
  'mod2-2': at(19, 12), // Shot Matching: 19/10/2026 ao meio-dia
  'mod2-3': at(18, 21), // Secundárias: trancada de novo, libera 18/10/2026 às 21h (24h)
  'mod3-1': at(18, 21), // Criando Look sem Plugins: trancada de novo, libera 18/10/2026 às 21h (24h)
  'mod3-2': at(19), // Film Look Creator: 19/10/2026 às 14h (+24h)
  'mod3-3': at(20), // Dehancer Pro: 20/10/2026 às 14h (+24h)
};

/** Todas as aulas do módulo Bônus são liberadas juntas. */
const MODULE_RELEASE_AT: Record<string, number> = {
  mod4: at(22), // Bônus: 22/10/2026 às 14h (+24h)
};

/** Momento da liberação (ms desde 1970), ou null se a aula já nasce liberada. */
export function getLessonReleaseAt(lessonId: string): number | null {
  if (Object.hasOwn(LESSON_RELEASE_AT, lessonId)) return LESSON_RELEASE_AT[lessonId];
  const moduleId = lessonId.split('-')[0];
  if (Object.hasOwn(MODULE_RELEASE_AT, moduleId)) return MODULE_RELEASE_AT[moduleId];
  return null;
}

/** Próximo momento de liberação depois de `now`, para o site se atualizar sozinho quando a hora chegar. */
export function getNextReleaseAfter(now: number): number | null {
  const all = [...Object.values(LESSON_RELEASE_AT), ...Object.values(MODULE_RELEASE_AT)].filter((t) => t > now);
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
