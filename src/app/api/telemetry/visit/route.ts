import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { z } from 'zod';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';
import {
  detectTrafficSource,
  classifyDeviceAndBrowser
} from '@/utils/trafficSourceDetector';

export const dynamic = 'force-dynamic';

const telemetrySchema = z.object({
  visitorId: z.string().max(128).optional().default(''),
  deviceFingerprint: z.string().max(200).optional().default(''),
  screenResolution: z.string().max(32).optional().default(''),
  clientReferrer: z.string().max(1000).optional().default(''),
  currentUrl: z.string().max(2000).optional().default(''),
}).strict();

export async function POST(req: NextRequest) {
  try {
    const allowed = await consumeRateLimit(req, 'telemetry-visit', 60, 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    const body = await readJsonLimited(req, 8_192);
    if (!body) {
      return NextResponse.json({ error: 'Requisição muito grande.' }, { status: 413 });
    }
    const parsed = telemetrySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    const { visitorId, deviceFingerprint, screenResolution, clientReferrer, currentUrl } = parsed.data;

    const ip = getClientIp(req) || 'UNKNOWN';

    // 2. Extração de Localização (Vercel Geolocation Headers)
    const country = req.headers.get('x-vercel-ip-country') || 'BR';
    const region = req.headers.get('x-vercel-ip-country-region') || null;
    const rawCity = req.headers.get('x-vercel-ip-city');
    const city = rawCity ? decodeURIComponent(rawCity) : null;
    const latitudeStr = req.headers.get('x-vercel-ip-latitude');
    const longitudeStr = req.headers.get('x-vercel-ip-longitude');
    const latitude = latitudeStr ? parseFloat(latitudeStr) : null;
    const longitude = longitudeStr ? parseFloat(longitudeStr) : null;

    // 3. User-Agent e Referrer
    const userAgent = req.headers.get('user-agent') || '';
    const serverReferrer = req.headers.get('referer') || '';
    const effectiveReferrer = clientReferrer || serverReferrer || '';

    // 4. Classificação de Tráfego e Dispositivo
    const attribution = detectTrafficSource(effectiveReferrer, currentUrl);
    const device = classifyDeviceAndBrowser(userAgent);

    const safeVisitorId = visitorId || `vis_${Math.random().toString(36).substring(2, 12)}`;

    // 5. Inserir no Supabase (site_traffic_analytics)
    const { error: dbError } = await supabaseAdmin
      .from('site_traffic_analytics')
      .insert({
        visitor_id: safeVisitorId,
        device_fingerprint: deviceFingerprint || null,
        ip,
        country: country === 'BR' ? 'Brasil' : country,
        region,
        city,
        latitude,
        longitude,
        device_type: device.deviceType,
        os: device.os,
        browser: device.browser,
        traffic_category: attribution.category,
        source_name: attribution.sourceName,
        referrer_url: effectiveReferrer || null,
        landing_path: attribution.landingPath || '/',
        utm_source: attribution.utmSource || null,
        utm_medium: attribution.utmMedium || null,
        utm_campaign: attribution.utmCampaign || null,
        utm_term: attribution.utmTerm || null,
        utm_content: attribution.utmContent || null,
        screen_resolution: screenResolution || null,
        user_agent: userAgent || null
      });

    if (dbError) {
      console.error('[Telemetry] Erro ao salvar visita no banco:', dbError);
    }

    // 6. Preparar resposta com Cookie de Atribuição para o Checkout
    const response = NextResponse.json({
      success: true,
      data: {
        visitorId: safeVisitorId,
        location: { country, region, city },
        attribution,
        device
      }
    });

    // Salvar cookie de sessão com os dados de atribuição para o Checkout capturar
    const attributionPayload = JSON.stringify({
      visitorId: safeVisitorId,
      sourceName: attribution.sourceName,
      category: attribution.category,
      deviceFingerprint,
      utmSource: attribution.utmSource || null
    });

    response.cookies.set('flmmkr_attribution', encodeURIComponent(attributionPayload), {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 dias
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (err: unknown) {
    console.error('[Telemetry] Erro interno:', err instanceof Error ? err.message : 'Falha interna');
    return NextResponse.json({ success: false, error: 'Erro ao registrar telemetria' }, { status: 500 });
  }
}
