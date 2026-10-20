import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, consumeKeyRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { hashClientIp } from '@/utils/ipHash';
import { isProductionRuntime } from '@/utils/runtimeEnv';
import { validatePrisma2Lead } from '@/utils/prisma2Lead';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

/** Registra o cadastro de quem vai baixar o PRISMA 2. Quem baixa é liberado pelo navegador só depois do "ok". */
export async function POST(req: NextRequest) {
  // Só aceita chamadas feitas pela própria página (bloqueia envio de outros sites).
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return json({ error: 'Requisição inválida.' }, 403);

  const body = await readJsonLimited(req, 4096);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Requisição inválida.' }, 400);
  const input = body as Record<string, unknown>;

  // Campo-isca invisível: humano deixa vazio. Finge sucesso para o robô não saber que foi barrado.
  if (typeof input.website === 'string' && input.website.length > 0) return json({ ok: true });

  const parsed = validatePrisma2Lead(input);
  if (!parsed.ok) return json({ error: parsed.error }, 400);

  const ip = getClientIp(req);
  const turnstile = await verifyTurnstile(input.turnstileToken, ip);
  if (!turnstile.ok) {
    if (turnstile.reason === 'misconfigured') return json({ error: 'Download temporariamente indisponível. Tente novamente em instantes.' }, 503);
    return json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página e tente de novo.' }, 403);
  }

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(req, 'prisma2:ip', 5, 900),
    consumeKeyRateLimit(parsed.data.email, 'prisma2:email', 3, 900),
  ]);
  if (ipAllowed === null || emailAllowed === null) {
    if (isProductionRuntime()) {
      console.error('[prisma2] rate limit indisponível em produção: cadastro recusado.');
      return json({ error: 'Download temporariamente indisponível. Tente novamente em instantes.' }, 503);
    }
    console.warn('[prisma2] rate limit indisponível (fora de produção): seguindo sem limite.');
  }
  if (ipAllowed === false || emailAllowed === false) {
    return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429, { 'Retry-After': '900' });
  }

  const { error } = await supabaseAdmin.from('prisma_download_leads').insert({ ...parsed.data, ip_hash: hashClientIp(ip) });
  if (error) {
    console.error('[prisma2] falha ao gravar cadastro:', error.code, error.message);
    return json({ error: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 500);
  }
  return json({ ok: true });
}
