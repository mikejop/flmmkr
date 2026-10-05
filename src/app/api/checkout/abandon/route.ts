import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      location,
      profession,
      paymentMethod,
      reason,
      trafficSource,
      deviceFingerprint,
      utmSource,
      referrer
    } = body;

    // Registra apenas se ao menos tiver nome ou profissão preenchidos
    if (!name && !profession && !location) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Recuperar atribuição de tráfego do cookie se não veio no body
    const cookieAttrRaw = req.cookies.get('flmmkr_attribution')?.value;
    let cookieAttr: any = null;
    if (cookieAttrRaw) {
      try {
        cookieAttr = JSON.parse(decodeURIComponent(cookieAttrRaw));
      } catch {}
    }

    // IP do visitante
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : (req.headers.get('x-real-ip') || '127.0.0.1');

    const finalTrafficSource = trafficSource || cookieAttr?.sourceName || 'Direto';
    const finalDeviceFingerprint = deviceFingerprint || cookieAttr?.deviceFingerprint || null;
    const finalUtmSource = utmSource || cookieAttr?.utmSource || null;
    const finalReferrer = referrer || req.headers.get('referer') || null;

    const { error } = await supabaseAdmin
      .from('checkout_abandonment_leads')
      .insert({
        full_name: name || 'Não informado',
        email: email || null,
        phone: phone || null,
        location: location || null,
        profession: profession || null,
        status: 'abandono_carrinho',
        payment_method: paymentMethod || null,
        failure_reason: reason || 'Usuário fechou o modal de checkout sem concluir o pagamento',
        traffic_source: finalTrafficSource,
        device_fingerprint: finalDeviceFingerprint,
        ip,
        utm_source: finalUtmSource,
        referrer: finalReferrer,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar lead de abandono com telemetria:', error);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro no endpoint de abandono de carrinho:', err?.message || err);
    return NextResponse.json({ error: 'Erro ao registrar abandono' }, { status: 500 });
  }
}
