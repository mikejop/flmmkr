import 'server-only';
import { isProductionRuntime } from '@/utils/runtimeEnv';

export type TurnstileResult =
  | { ok: true; reason?: 'skipped_dev' | 'provider_down' }
  | { ok: false; reason: 'misconfigured' | 'invalid' };

/**
 * Valida o token do Cloudflare Turnstile no servidor.
 * - Produção sem chave: recusa (misconfigured, vira 503). Nunca libera por falta de chave.
 * - Desenvolvimento sem chave: libera com aviso.
 * - Chave presente mas Cloudflare fora do ar (timeout, rede, 5xx): libera e registra no log; o rate limit segue valendo.
 */
export async function verifyTurnstile(token: unknown, ip: string | null): Promise<TurnstileResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    if (isProductionRuntime()) {
      console.error('[turnstile] TURNSTILE_SECRET_KEY ausente em produção: checkout recusado.');
      return { ok: false, reason: 'misconfigured' };
    }
    console.warn('[turnstile] TURNSTILE_SECRET_KEY ausente: verificação anti-bot desativada (só fora de produção).');
    return { ok: true, reason: 'skipped_dev' };
  }
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return { ok: false, reason: 'invalid' };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (res.status >= 500) {
      console.warn('[turnstile] Cloudflare respondeu', res.status, ': liberando; rate limit continua ativo.');
      return { ok: true, reason: 'provider_down' };
    }
    if (!res.ok) return { ok: false, reason: 'invalid' };
    const data = (await res.json()) as { success?: boolean };
    return data.success === true ? { ok: true } : { ok: false, reason: 'invalid' };
  } catch (err) {
    console.warn('[turnstile] Cloudflare indisponível (', err instanceof Error ? err.name : 'erro', '): liberando; rate limit continua ativo.');
    return { ok: true, reason: 'provider_down' };
  }
}
