/**
 * Cache de dados no navegador do aluno (localStorage), pensado para poupar banco e servidor.
 *
 * - Validade máxima: 7 dias (CACHE_MAX_AGE_MS).
 * - Versionado: toda chave carrega APP_VERSION. Quando o sistema muda (novo deploy), as entradas
 *   de versões antigas são descartadas e os dados são buscados de novo.
 * - Escopo por usuário: `purgeClientCache()` limpa tudo no logout (computador compartilhado).
 */
import { APP_VERSION } from '@/lib/appVersion';

export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const PREFIX = 'flmmkr:cache:';

interface Entry<T> {
  v: string;
  t: number;
  d: T;
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

const keyOf = (key: string) => `${PREFIX}${key}`;

export interface CacheHit<T> {
  value: T;
  ageMs: number;
}

/** Lê uma entrada válida (versão atual e dentro de 7 dias). */
export function readCache<T>(key: string): CacheHit<T> | null {
  const store = storage();
  if (!store) return null;
  try {
    const raw = store.getItem(keyOf(key));
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    const ageMs = Date.now() - entry.t;
    if (entry.v !== APP_VERSION || ageMs > CACHE_MAX_AGE_MS || ageMs < 0) {
      store.removeItem(keyOf(key));
      return null;
    }
    return { value: entry.d, ageMs };
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, value: T): void {
  const store = storage();
  if (!store) return;
  try {
    const entry: Entry<T> = { v: APP_VERSION, t: Date.now(), d: value };
    store.setItem(keyOf(key), JSON.stringify(entry));
  } catch {
    // Cota cheia ou modo privado: segue sem cache.
  }
}

export function removeCache(key: string): void {
  try {
    storage()?.removeItem(keyOf(key));
  } catch {
    /* noop */
  }
}

/** Remove entradas de versões antigas ou vencidas. Chamar uma vez na carga do app. */
export function sweepClientCache(): void {
  const store = storage();
  if (!store) return;
  try {
    const stale: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const name = store.key(i);
      if (!name || !name.startsWith(PREFIX)) continue;
      try {
        const entry = JSON.parse(store.getItem(name) || '') as Entry<unknown>;
        if (entry.v !== APP_VERSION || Date.now() - entry.t > CACHE_MAX_AGE_MS) stale.push(name);
      } catch {
        stale.push(name);
      }
    }
    stale.forEach((name) => store.removeItem(name));
  } catch {
    /* noop */
  }
}

/** Apaga todo o cache de dados (logout / troca de conta). */
export function purgeClientCache(): void {
  const store = storage();
  if (!store) return;
  try {
    const all: string[] = [];
    for (let i = 0; i < store.length; i++) {
      const name = store.key(i);
      if (name && name.startsWith(PREFIX)) all.push(name);
    }
    all.forEach((name) => store.removeItem(name));
  } catch {
    /* noop */
  }
}

/**
 * Busca JSON usando o cache quando a entrada é mais nova que `freshMs`.
 * Se estiver vencida (mas dentro de 7 dias), devolve a antiga imediatamente via `onStale`
 * e revalida em segundo plano (stale-while-revalidate).
 */
export async function cachedJson<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  { freshMs, onStale }: { freshMs: number; onStale?: (value: T) => void }
): Promise<T | null> {
  const hit = readCache<T>(key);
  if (hit && hit.ageMs < freshMs) return hit.value;
  if (hit && onStale) onStale(hit.value);
  try {
    const fresh = await fetcher();
    if (fresh !== null && fresh !== undefined) {
      writeCache(key, fresh);
      return fresh;
    }
  } catch {
    // Sem rede: usa o que houver no cache.
  }
  return hit ? hit.value : null;
}
