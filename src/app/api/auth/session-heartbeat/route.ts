import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/userService';
import { validateAndSanitizeBody } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { safe, sanitized } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ valid: false, error: 'Parâmetros suspeitos' }, { status: 400 });
    }

    const { sessionToken, userId } = sanitized;

    if (!sessionToken || !userId) {
      return NextResponse.json({ valid: false, error: 'Token ou usuário não fornecido.' }, { status: 400 });
    }

    // Buscar status da sessão atual
    const { data: sessionRecord, error } = await supabaseAdmin
      .from('user_active_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (error || !sessionRecord) {
      // Se não encontrou o token, verificar se há uma sessão ativa mais recente deste usuário
      const { data: latestActive } = await supabaseAdmin
        .from('user_active_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return NextResponse.json({
        valid: false,
        replaced: true,
        replacedByDevice: latestActive?.device_name || 'Outro Dispositivo',
        replacedByLocation: latestActive?.location || 'Brasil',
        replacedAt: latestActive?.created_at || new Date().toISOString(),
      });
    }

    // Se a sessão foi marcada como inativa (outro dispositivo logou)
    if (!sessionRecord.is_active) {
      return NextResponse.json({
        valid: false,
        replaced: true,
        replacedByDevice: sessionRecord.replaced_by_device || 'Outro Dispositivo',
        replacedByLocation: sessionRecord.replaced_by_location || 'Brasil',
        replacedAt: sessionRecord.replaced_at || new Date().toISOString(),
      });
    }

    // Se estiver ativa, atualizar o last_heartbeat_at
    await supabaseAdmin
      .from('user_active_sessions')
      .update({ last_heartbeat_at: new Date().toISOString() })
      .eq('id', sessionRecord.id);

    return NextResponse.json({
      valid: true,
      deviceName: sessionRecord.device_name,
      location: sessionRecord.location,
    });
  } catch (err: any) {
    console.error('[Session Heartbeat Error]:', err);
    return NextResponse.json({ valid: true, error: err?.message }, { status: 500 });
  }
}
