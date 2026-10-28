import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, consumeKeyRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { hashClientIp } from '@/utils/ipHash';
import { isProductionRuntime } from '@/utils/runtimeEnv';
import { validatePrisma2Lead } from '@/utils/prisma2Lead';
import { PLUGIN_DOWNLOADS, type PluginOs } from '@/config/plugins';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

/** Registra o cadastro de quem vai baixar os plugins. O download é liberado pelo navegador só depois do "ok". */
export async function POST(req: NextRequest) {
  // Só aceita chamadas feitas pela própria página (bloqueia envio de outros sites).
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return json({ error: 'Requisição inválida.' }, 403);

  const body = await readJsonLimited(req, 4096);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Requisição inválida.' }, 400);
  const input = body as Record<string, unknown>;

  // Campo-isca invisível: humano deixa vazio. Finge sucesso para o robô não saber que foi barrado.
  if (typeof input.website === 'string' && input.website.length > 0) return json({ ok: true });

  // Mesmas regras de nome e e-mail do cadastro do PRISMA 2; aqui só esses três campos.
  const parsed = validatePrisma2Lead({ firstName: input.firstName, lastName: input.lastName, email: input.email });
  if (!parsed.ok) return json({ error: parsed.error, field: parsed.field }, 400);
  const os = typeof input.os === 'string' && input.os in PLUGIN_DOWNLOADS ? (input.os as PluginOs) : null;

  const ip = getClientIp(req);
  const turnstile = await verifyTurnstile(input.turnstileToken, ip);
  if (!turnstile.ok) {
    if (turnstile.reason === 'misconfigured') return json({ error: 'Download temporariamente indisponível. Tente novamente em instantes.' }, 503);
    return json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página e tente de novo.' }, 403);
  }

  const [ipAllowed, emailAllowed] = await Promise.all([
    consumeRateLimit(req, 'plugins:ip', 5, 900),
    consumeKeyRateLimit(parsed.data.email, 'plugins:email', 3, 900),
  ]);
  if (ipAllowed === null || emailAllowed === null) {
    if (isProductionRuntime()) {
      console.error('[plugins] rate limit indisponível em produção: cadastro recusado.');
      return json({ error: 'Download temporariamente indisponível. Tente novamente em instantes.' }, 503);
    }
    console.warn('[plugins] rate limit indisponível (fora de produção): seguindo sem limite.');
  }
  if (ipAllowed === false || emailAllowed === false) {
    return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429, { 'Retry-After': '900' });
  }

  // Quem já se cadastrou e volta para baixar de novo só atualiza o registro (o e-mail é único).
  const { first_name, last_name, email } = parsed.data;
  const now = new Date().toISOString();
  // Consentimento (LGPD) para notificações e e-mail marketing: só vale marcado explicitamente; desmarcado revoga.
  const marketingOptIn = input.marketingOptIn === true;
  const { error } = await supabaseAdmin
    .from('flmmkr-plugins')
    .upsert(
      {
        first_name, last_name, email, os, ip_hash: hashClientIp(ip), updated_at: now,
        marketing_opt_in: marketingOptIn, marketing_opt_in_at: marketingOptIn ? now : null,
      },
      { onConflict: 'email' }
    );
  if (error) {
    console.error('[plugins] falha ao gravar cadastro:', error.code, error.message);
    return json({ error: 'Não foi possível concluir agora. Tente novamente em instantes.' }, 500);
  }
  return json({ ok: true });
}
