import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';
import { getDeviceInfoFromRequest } from '@/utils/deviceDetection';
import crypto from 'crypto';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { safe } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: 'Parâmetros suspeitos' }, { status: 400 });
    }

    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    const deviceInfo = getDeviceInfoFromRequest(req);
    const now = new Date();

    // Desativar sessões antigas
    const { error: deactivateError } = await supabaseAdmin
      .from('user_active_sessions')
      .update({
        is_active: false,
        replaced_by_device: deviceInfo.deviceName,
        replaced_by_location: deviceInfo.location,
        replaced_at: now.toISOString(),
      })
      .eq('user_id', userId)
      .eq('is_active', true);
    if (deactivateError) throw deactivateError;

    // Gerar e registrar novo token de sessão
    const sessionToken = crypto.randomUUID();
    const { error: insertError } = await supabaseAdmin.from('user_active_sessions').insert({
      user_id: userId,
      session_token: sessionToken,
      device_name: deviceInfo.deviceName,
      ip_address: deviceInfo.ipAddress,
      location: deviceInfo.location,
      is_active: true,
      created_at: now.toISOString(),
      last_heartbeat_at: now.toISOString(),
    });
    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      sessionToken,
      deviceName: deviceInfo.deviceName,
      location: deviceInfo.location,
    });
  } catch (err: any) {
    console.error('[Register Session Error]:', err);
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
