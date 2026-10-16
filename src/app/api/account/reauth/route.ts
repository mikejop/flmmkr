import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { markReauthenticated, REAUTH_TTL_SECONDS } from '@/utils/reauth';
import { logAudit } from '@/services/auditLog';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const bodySchema = z.object({ password: z.string().min(1).max(200) }).strict();

/**
 * Reautenticação para ações sensíveis: confirma a senha e libera ações sensíveis por 5 minutos.
 * Usa um cliente isolado (sem cookies), então não mexe na sessão atual.
 */
export async function POST(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user?.email) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: NO_STORE });

  // 5 tentativas a cada 15 minutos por usuário (senha errada também conta).
  const allowed = await consumeUserRateLimit(user.id, 'account-reauth', 5, 900);
  if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  if (!allowed) return NextResponse.json({ error: 'Muitas tentativas. Aguarde alguns minutos.' }, { status: 429, headers: NO_STORE });

  const parsed = bodySchema.safeParse(await readJsonLimited(req, 1024));
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400, headers: NO_STORE });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });

  const isolated = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
  const { error } = await isolated.auth.signInWithPassword({ email: user.email, password: parsed.data.password });
  if (error) {
    await logAudit({ userId: user.id, action: 'reauth_failed', request: req });
    return NextResponse.json({ error: 'Senha incorreta.' }, { status: 400, headers: NO_STORE });
  }

  if (!(await markReauthenticated(user.id))) {
    return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  }
  await logAudit({ userId: user.id, action: 'reauth_ok', request: req });
  return NextResponse.json({ ok: true, validForSeconds: REAUTH_TTL_SECONDS }, { headers: NO_STORE });
}
