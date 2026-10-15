import 'server-only';

/**
 * Valida o token do Cloudflare Turnstile no servidor.
 * Sem TURNSTILE_SECRET_KEY a checagem é pulada (registra aviso), para não derrubar o checkout num deploy sem a chave.
 */
export async function verifyTurnstile(token: unknown, ip: string | null): Promise<{ ok: boolean; skipped?: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.warn('[turnstile] TURNSTILE_SECRET_KEY ausente: verificação anti-bot desativada.');
    return { ok: true, skipped: true };
  }
  if (typeof token !== 'string' || token.length < 10 || token.length > 2048) return { ok: false };

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip) body.set('remoteip', ip);
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { success?: boolean };
    return { ok: data.success === true };
  } catch (err) {
    console.error('[turnstile] falha ao verificar token:', err);
    return { ok: false };
  }
}
