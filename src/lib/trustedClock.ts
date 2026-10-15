/**
 * Relógio confiável: usa a hora do SERVIDOR e a leva adiante com performance.now(), que é monotônico e
 * não muda quando o aluno mexe no relógio do computador. A hora do aparelho (Date.now) nunca é usada.
 * Enquanto o servidor não respondeu, a hora é desconhecida (null) e quem usa deve tratar como bloqueado.
 */

const SYNC_URL = '/api/server-time';
const RESYNC_MS = 60_000;

let offset: number | null = null; // hora do servidor - performance.now() (no mesmo instante)
let bestRtt = Infinity;
let started = false;
const listeners = new Set<() => void>();

export function trustedNow(): number | null {
  return offset === null ? null : offset + performance.now();
}

export function isClockSynced(): boolean {
  return offset !== null;
}

export function subscribeClock(cb: () => void): () => void {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
}

async function sync(): Promise<void> {
  try {
    const t0 = performance.now();
    const res = await fetch(`${SYNC_URL}?t=${Math.floor(t0)}`, { cache: 'no-store', credentials: 'same-origin' });
    const t1 = performance.now();
    if (!res.ok) return;
    const body = (await res.json()) as { now?: number };
    if (typeof body.now !== 'number' || !Number.isFinite(body.now)) return;
    const rtt = t1 - t0;
    // A hora do servidor chegou aproximadamente no meio da viagem; prefere a medida de menor atraso.
    if (offset === null || rtt <= bestRtt + 500) {
      bestRtt = Math.min(bestRtt, rtt);
      offset = body.now + rtt / 2 - t1;
      listeners.forEach((cb) => cb());
    }
  } catch {
    /* sem rede: continua com a última medida (ou sem hora, e tudo bloqueado) */
  }
}

/** Liga a sincronização (uma vez): ao abrir, a cada minuto e ao voltar para a aba. */
export function startClockSync(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  void sync();
  setInterval(() => { void sync(); }, RESYNC_MS);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') void sync(); });
  window.addEventListener('online', () => { void sync(); });
  // Se a primeira tentativa falhar, tenta de novo logo.
  const retry = setInterval(() => { if (offset !== null) clearInterval(retry); else void sync(); }, 3000);
}
