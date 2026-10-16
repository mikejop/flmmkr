import 'server-only';
import { createHmac } from 'node:crypto';
import { getClientIp } from '@/utils/clientIp';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getRedis } from '@/utils/redis';

/**
 * Consome 1 unidade de um contador por janela. true = dentro do limite, false = estourou, null = nenhum backend disponível.
 * Principal: Upstash Redis (INCR + EXPIRE). Reserva: função atômica no Postgres. O limite nunca é desligado:
 * se os dois falharem devolve null e quem chama decide (em produção, recusa).
 */
async function consumeCounter(key: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const redis = getRedis();
  if (redis) {
    try {
      const redisKey = `rl:${key}`;
      const count = await redis.incr(redisKey);
      if (count === 1) await redis.expire(redisKey, windowSeconds);
      else if (count > limit && (await redis.ttl(redisKey)) < 0) await redis.expire(redisKey, windowSeconds);
      return count <= limit;
    } catch (err) {
      console.error('[rate-limit] Upstash indisponível, usando Postgres:', err instanceof Error ? err.message : err);
    }
  }
  const { data, error } = await supabaseAdmin.rpc('consume_api_rate_limit', {
    p_key: key,
    p_max_requests: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== 'boolean') return null;
  return data;
}

function keyFor(bucket: string, subject: string): string | null {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!secret || !subject) return null;
  return createHmac('sha256', secret).update(`${bucket}:${subject}`).digest('hex');
}

export async function consumeRateLimit(request: Request, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const ip = getClientIp(request);
  const key = ip ? keyFor(bucket, ip) : null;
  return key ? consumeCounter(key, limit, windowSeconds) : null;
}

export async function readJsonLimited(request: Request, maxBytes: number): Promise<unknown | null> {
  const declaredLength = Number(request.headers.get('content-length') || 0);
  if (declaredLength > maxBytes) return null;
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > maxBytes) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

/**
 * Rate limit por USUÁRIO. null = indisponível (sem RATE_LIMIT_HMAC_SECRET ou sem backend):
 * quem chama deve recusar a requisição (falha fechada).
 */
export async function consumeUserRateLimit(userId: string, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const key = keyFor(bucket, `user:${userId}`);
  return key ? consumeCounter(key, limit, windowSeconds) : null;
}

/** Rate limit por identificador livre (ex.: e-mail normalizado). null = indisponível. */
export async function consumeKeyRateLimit(identifier: string, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const key = keyFor(bucket, `key:${identifier}`);
  return key ? consumeCounter(key, limit, windowSeconds) : null;
}
