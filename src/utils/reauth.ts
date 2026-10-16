import 'server-only';
import { cacheDel, cacheGet, cacheSet, getRedis } from '@/utils/redis';
import { isProductionRuntime } from '@/utils/runtimeEnv';

/** Reautenticação recente (senha confirmada nos últimos 5 minutos). Guardada no Redis; fora de produção cai para memória. */
export const REAUTH_TTL_SECONDS = 300;
const memory = new Map<string, number>();
const key = (userId: string) => `reauth:${userId}`;

/** false = não foi possível registrar (produção sem Redis): quem chama deve recusar. */
export async function markReauthenticated(userId: string): Promise<boolean> {
  if (getRedis()) {
    await cacheSet(key(userId), 1, REAUTH_TTL_SECONDS);
    return (await cacheGet<number>(key(userId))) === 1;
  }
  if (isProductionRuntime()) return false;
  memory.set(userId, Date.now() + REAUTH_TTL_SECONDS * 1000);
  return true;
}

export async function hasRecentReauth(userId: string): Promise<boolean> {
  if (getRedis()) return (await cacheGet<number>(key(userId))) === 1;
  if (isProductionRuntime()) return false;
  return (memory.get(userId) ?? 0) > Date.now();
}

export async function clearReauth(userId: string): Promise<void> {
  memory.delete(userId);
  await cacheDel(key(userId));
}
