import 'server-only';
import { Redis } from '@upstash/redis';

let client: Redis | null | undefined;

/** Cliente do Upstash Redis (REST). null se não configurado: quem chama cai no banco, nunca concede nada por falta de cache. */
export function getRedis(): Redis | null {
  if (client !== undefined) return client;
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  client = url && token ? new Redis({ url, token, retry: { retries: 1, backoff: () => 100 } }) : null;
  return client;
}

/** Lê um JSON do Redis. null em miss, erro ou Redis ausente (nunca lança). */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    return (await redis.get<T>(key)) ?? null;
  } catch (err) {
    console.error('[redis] falha ao ler', key.split(':')[0], err instanceof Error ? err.message : err);
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const redis = getRedis();
  if (!redis || ttlSeconds <= 0) return;
  try {
    await redis.set(key, value, { ex: Math.floor(ttlSeconds) });
  } catch (err) {
    console.error('[redis] falha ao gravar', key.split(':')[0], err instanceof Error ? err.message : err);
  }
}

/** Apaga chaves exatas. Retorna false se o Redis falhou (quem revoga acesso deve registrar o aviso). */
export async function cacheDel(...keys: string[]): Promise<boolean> {
  const redis = getRedis();
  if (!redis || keys.length === 0) return true;
  try {
    await redis.del(...keys);
    return true;
  } catch (err) {
    console.error('[redis] falha ao apagar chaves', err instanceof Error ? err.message : err);
    return false;
  }
}

/** Apaga todas as chaves de um prefixo (ex.: `drm:<userId>:`). Usa SCAN, sem bloquear o Redis. */
export async function cacheDelPrefix(prefix: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return true;
  try {
    let cursor = '0';
    do {
      const [next, keys] = await redis.scan(cursor, { match: `${prefix}*`, count: 100 });
      cursor = String(next);
      if (keys.length) await redis.del(...keys);
    } while (cursor !== '0');
    return true;
  } catch (err) {
    console.error('[redis] falha ao apagar prefixo', err instanceof Error ? err.message : err);
    return false;
  }
}
