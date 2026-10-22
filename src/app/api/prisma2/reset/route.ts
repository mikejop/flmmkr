import { NextRequest, NextResponse } from 'next/server';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { isProductionRuntime } from '@/utils/runtimeEnv';

export const dynamic = 'force-dynamic';

// Edge Function do projeto Supabase do PRISMA 2 (não é o Supabase da área de membros). Sem segredo aqui: a função é pública e se protege pelo link de uso único.
const FUNCTION_URL = process.env.PRISMA2_RESET_URL || 'https://gblhmocspdnvloqpugvh.supabase.co/functions/v1/password-reset';
const json = (body: Record<string, unknown>, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/** Ponte da página /prisma/<token> para a Edge Function password-reset (confere e gasta o link de redefinição de senha). */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return json({ ok: false, reason: 'invalid' }, 403);

  const body = await readJsonLimited(req, 2048);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ ok: false, reason: 'invalid' }, 400);
  const { action, token, password } = body as Record<string, unknown>;
  if ((action !== 'check' && action !== 'reset') || typeof token !== 'string' || !/^[0-9a-f]{64}$/.test(token)) return json({ ok: false, reason: 'invalid_token' }, 400);
  if (action === 'reset' && (typeof password !== 'string' || password.length < 8 || password.length > 200)) return json({ ok: false, reason: 'weak_password' }, 400);

  const allowed = await consumeRateLimit(req, 'prisma2:reset', 20, 900);
  if (allowed === null && isProductionRuntime()) return json({ ok: false, reason: 'server' }, 503);
  if (allowed === false) return json({ ok: false, reason: 'rate_limited' }, 429);

  try {
    const r = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(action === 'check' ? { action, token } : { action, token, password }),
      cache: 'no-store',
    });
    const data = await r.json().catch(() => null);
    if (!data || typeof data !== 'object') return json({ ok: false, reason: 'server' }, 502);
    return json(data as Record<string, unknown>, r.ok ? 200 : 502);
  } catch {
    return json({ ok: false, reason: 'server' }, 502);
  }
}
