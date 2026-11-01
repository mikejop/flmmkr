import { NextRequest, NextResponse } from 'next/server';
import { requireActiveStudent } from '@/utils/supabase/access';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { PLUGIN_DOWNLOADS, type PluginOs } from '@/config/plugins';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** FLMMKR FX pela área de membros: registra quem baixou, quando e qual sistema, e devolve o link do arquivo. */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return NextResponse.json({ error: 'Requisição inválida.' }, { status: 403, headers: NO_STORE });

  const gate = await requireActiveStudent();
  if (!gate.ok) return gate.response;
  const { user } = gate.student;

  const body = (await readJsonLimited(req, 1024)) as { os?: unknown } | null;
  const os = typeof body?.os === 'string' && body.os in PLUGIN_DOWNLOADS ? (body.os as PluginOs) : null;
  if (!os) return NextResponse.json({ error: 'Sistema inválido.' }, { status: 400, headers: NO_STORE });

  const allowed = await consumeUserRateLimit(user.id, 'member-plugin-download', 10, 3600);
  if (allowed === false) return NextResponse.json({ error: 'Muitos downloads em pouco tempo. Tente de novo mais tarde.' }, { status: 429, headers: NO_STORE });

  const { error } = await supabaseAdmin.from('member_plugin_downloads').insert({ user_id: user.id, email: user.email ?? null, os });
  if (error) {
    console.error('[members/plugin-download] falha ao registrar:', error.code, error.message);
    return NextResponse.json({ error: 'Não foi possível iniciar o download agora.' }, { status: 500, headers: NO_STORE });
  }

  const item = PLUGIN_DOWNLOADS[os];
  return NextResponse.json({ url: item.url, filename: item.file }, { headers: NO_STORE });
}
