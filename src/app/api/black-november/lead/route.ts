import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, consumeKeyRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { hashClientIp } from '@/utils/ipHash';
import { isProductionRuntime } from '@/utils/runtimeEnv';
import { validateBlackNovemberLead } from '@/utils/blackNovemberLead';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

/** Inscrição para ser avisado do início da Black November do Color Master Produtos. */
export async function POST(req: NextRequest) {
  // Só aceita chamadas feitas pela própria página (bloqueia envio de outros sites).
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return json({ error: 'Requisição inválida.' }, 403);

  const body = await readJsonLimited(req, 4096);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Requisição inválida.' }, 400);
  const input = body as Record<string, unknown>;

  // Campo-isca invisível: humano deixa vazio. Finge sucesso para o robô não saber que foi barrado.
  if (typeof input.website === 'string' && input.website.length > 0) return json({ ok: true });

  const parsed = validateBlackNovemberLead(input);
  if (!parsed.ok) return json({ error: parsed.error, field: parsed.field }, 400);

  const ip = getClientIp(req);
  const turnstile = await verifyTurnstile(input.turnstileToken, ip);
  if (!turnstile.ok) {
    if (turnstile.reason === 'misconfigured') return json({ error: 'Inscrição temporariamente indisponível. Tente novamente em instantes.' }, 503);
    return json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página e tente de novo.' }, 403);
  }

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(req, 'black-november:ip', 5, 900),
    consumeKeyRateLimit(parsed.data.email, 'black-november:email', 3, 900),
  ]);
  if (ipAllowed === null || emailAllowed === null) {
    if (isProductionRuntime()) {
      console.error('[black-november] rate limit indisponível em produção: inscrição recusada.');
      return json({ error: 'Inscrição temporariamente indisponível. Tente novamente em instantes.' }, 503);
    }
    console.warn('[black-november] rate limit indisponível (fora de produção): seguindo sem limite.');
  }
  if (ipAllowed === false || emailAllowed === false) {
    return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429, { 'Retry-After': '900' });
  }

  // Quem já se inscreveu recebe "ok" de novo (sem duplicar e sem revelar que o e-mail já existia).
  const { error } = await supabaseAdmin
    .from('black_november_leads')
    .upsert({ ...parsed.data, ip_hash: hashClientIp(ip) }, { onConflict: 'email', ignoreDuplicates: true });
  if (error) {
    console.error('[black-november] falha ao gravar inscrição:', error.code, error.message);
    return json({ error: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 500);
  }
  return json({ ok: true });
}
