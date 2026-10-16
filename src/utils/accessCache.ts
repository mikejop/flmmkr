import 'server-only';
import { cacheDel, cacheDelPrefix } from '@/utils/redis';

/** TTL do resultado de verificação de acesso no Redis (chave `access:<userId>`). */
export const ACCESS_CACHE_TTL_SECONDS = 300;
export const accessKey = (userId: string) => `access:${userId}`;
export const drmKey = (userId: string, videoId: string) => `drm:${userId}:${videoId}`;
export const signedUrlKey = (userId: string, path: string) => `signed:${userId}:${path}`;

/**
 * Esquece TUDO que está em cache para um aluno: verificação de acesso, tokens DRM do Panda e URLs assinadas.
 * Chamar ao liberar e ao revogar acesso. Devolve false se o Redis falhou (quem revoga deve tratar como erro e repetir).
 */
export async function invalidateUserAccess(userId: string): Promise<boolean> {
  const results = await Promise.all([
    cacheDel(accessKey(userId)),
    cacheDelPrefix(`drm:${userId}:`),
    cacheDelPrefix(`signed:${userId}:`),
  ]);
  return results.every(Boolean);
}
