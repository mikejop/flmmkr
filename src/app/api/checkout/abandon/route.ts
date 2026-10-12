import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { z } from 'zod';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

const leadSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email().max(254).optional(),
  phone: z.string().max(40).optional(),
  location: z.string().max(200).optional(),
  profession: z.string().max(120).optional(),
  paymentMethod: z.string().max(40).optional(),
  reason: z.string().max(500).optional(),
  trafficSource: z.string().max(120).optional(),
  deviceFingerprint: z.string().max(200).optional(),
  utmSource: z.string().max(120).optional(),
  referrer: z.string().max(1000).optional(),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const allowed = await consumeRateLimit(req, 'checkout-abandon', 10, 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    const body = await readJsonLimited(req, 16_384);
    if (!body) {
      return NextResponse.json({ error: 'Requisição muito grande.' }, { status: 413 });
    }
    const parsed = leadSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
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
    } = parsed.data;

    // Registra apenas se ao menos tiver nome ou profissão preenchidos
    if (!name && !profession && !location) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Recuperar atribuição de tráfego do cookie se não veio no body
    const cookieAttrRaw = req.cookies.get('flmmkr_attribution')?.value;
    let cookieAttr: { sourceName?: string; deviceFingerprint?: string; utmSource?: string } | null = null;
    if (cookieAttrRaw) {
      try {
        const parsed: unknown = JSON.parse(decodeURIComponent(cookieAttrRaw));
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          cookieAttr = parsed as typeof cookieAttr;
        }
      } catch {}
    }

    // IP do visitante
    const ip = getClientIp(req);

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
        ip: ip || 'UNKNOWN',
        utm_source: finalUtmSource,
        referrer: finalReferrer,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar lead de abandono com telemetria:', error);
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Erro no endpoint de abandono de carrinho:', err instanceof Error ? err.message : 'Falha interna');
    return NextResponse.json({ error: 'Erro ao registrar abandono' }, { status: 500 });
  }
}
