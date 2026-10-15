import 'server-only';
import { createHmac } from 'node:crypto';
import { getClientIp } from '@/utils/clientIp';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function consumeRateLimit(request: Request, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const ip = getClientIp(request);
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!ip || !secret) return null;

  const key = createHmac('sha256', secret).update(`${bucket}:${ip}`).digest('hex');
  const { data, error } = await supabaseAdmin.rpc('consume_api_rate_limit', {
    p_key: key,
    p_max_requests: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== 'boolean') return null;
  return data;
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
 * Rate limit por USUÁRIO (mesma função atômica do banco). null = indisponível (sem RATE_LIMIT_HMAC_SECRET ou erro):
 * quem chama deve recusar a requisição (falha fechada).
 */
export async function consumeUserRateLimit(userId: string, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!userId || !secret) return null;
  const key = createHmac('sha256', secret).update(`${bucket}:user:${userId}`).digest('hex');
  const { data, error } = await supabaseAdmin.rpc('consume_api_rate_limit', {
    p_key: key,
    p_max_requests: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== 'boolean') return null;
  return data;
}

/** Rate limit por identificador livre (ex.: e-mail normalizado). null = indisponível. */
export async function consumeKeyRateLimit(identifier: string, bucket: string, limit: number, windowSeconds: number): Promise<boolean | null> {
  const secret = process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  if (!identifier || !secret) return null;
  const key = createHmac('sha256', secret).update(`${bucket}:key:${identifier}`).digest('hex');
  const { data, error } = await supabaseAdmin.rpc('consume_api_rate_limit', {
    p_key: key,
    p_max_requests: limit,
    p_window_seconds: windowSeconds,
  });
  if (error || typeof data !== 'boolean') return null;
  return data;
}
