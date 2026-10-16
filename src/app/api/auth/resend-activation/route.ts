import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { consumeRateLimit, consumeKeyRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { getClientIp } from '@/utils/clientIp';
import { createActivationToken } from '@/services/activationService';
import { sendActivationEmail } from '@/services/emailService';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const bodySchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  turnstileToken: z.string().max(2048).optional(),
}).strict();

// Resposta igual para qualquer e-mail: ninguém descobre quem é aluno.
const GENERIC = { ok: true, message: 'Se existir um acesso aguardando ativação para este e-mail, enviamos um novo link.' };

/**
 * Reenvia o link de primeiro acesso (link expirado, perdido ou e-mail que não chegou).
 * Só vale para quem já pagou e ainda não criou a senha. Limites: 3 por hora por e-mail e 10 por hora por IP.
 */
export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await readJsonLimited(req, 2048));
  if (!parsed.success) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400, headers: NO_STORE });
  const { email } = parsed.data;

  const turnstile = await verifyTurnstile(parsed.data.turnstileToken, getClientIp(req));
  if (!turnstile.ok) {
    return NextResponse.json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página.' }, { status: turnstile.reason === 'misconfigured' ? 503 : 403, headers: NO_STORE });
  }

  const [ipOk, emailOk] = await Promise.all([
    consumeRateLimit(req, 'resend-activation:ip', 10, 3600),
    consumeKeyRateLimit(email, 'resend-activation:email', 3, 3600),
  ]);
  if (ipOk === null || emailOk === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  if (!ipOk || !emailOk) return NextResponse.json({ error: 'Muitas tentativas. Tente de novo mais tarde.' }, { status: 429, headers: NO_STORE });

  try {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, has_access, payment_status')
      .eq('email', email)
      .maybeSingle();
    if (profile?.id && profile.has_access === true && profile.payment_status === 'CONFIRMED') {
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      const alreadyHasPassword = !!authUser?.user?.user_metadata?.password_set_at;
      if (authUser?.user && !alreadyHasPassword) {
        const token = await createActivationToken(profile.id, email);
        await sendActivationEmail({ email, name: profile.full_name || 'Aluno', activationUrl: token.url });
      }
    }
  } catch (err) {
    console.error('[resend-activation]', err instanceof Error ? err.message : err);
  }
  return NextResponse.json(GENERIC, { headers: NO_STORE });
}
