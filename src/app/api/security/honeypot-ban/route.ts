import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ip, mac, honeypotPath, userAgent, headers } = body;

    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const finalIp = ip || (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '127.0.0.1';

    console.warn(`[HONEYPOT REGISTRATION] Banindo atacante: IP=${finalIp}, MAC=${mac}, Rota=${honeypotPath}`);

    await supabaseAdmin.from('blocked_attackers').insert({
      ip_address: finalIp,
      mac_address: mac || null,
      honeypot_triggered: honeypotPath || 'UNKNOWN_HONEYPOT',
      user_agent: userAgent || req.headers.get('user-agent') || null,
      request_headers: headers || null,
      is_banned: true,
      notes: 'Bloqueio automático acionado pelo middleware do Honeypot.'
    });

    return NextResponse.json({ banned: true });
  } catch (err: any) {
    console.error('[Honeypot Ban API Error]:', err);
    return NextResponse.json({ error: 'Erro ao processar banimento' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ip = searchParams.get('ip');
    const mac = searchParams.get('mac');

    if (!ip && !mac) {
      return NextResponse.json({ banned: false });
    }

    let query = supabaseAdmin.from('blocked_attackers').select('id').eq('is_banned', true);
    if (ip && mac) {
      query = query.or(`ip_address.eq.${ip},mac_address.eq.${mac}`);
    } else if (ip) {
      query = query.eq('ip_address', ip);
    } else if (mac) {
      query = query.eq('mac_address', mac);
    }

    const { data } = await query.limit(1);
    const isBanned = !!(data && data.length > 0);

    return NextResponse.json({ banned: isBanned });
  } catch (err) {
    return NextResponse.json({ banned: false });
  }
}
