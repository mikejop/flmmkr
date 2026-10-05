import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentBatchPrice,
  resolveOfferTimerSession
} from '@/utils/offerPricing';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // 1. Extração segura do IP no servidor
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
  const userAgent = req.headers.get('user-agent') || 'unknown';

  // 2. Extração do MAC Address (Impressão Digital do Computador)
  const { searchParams } = new URL(req.url);
  const cookieMac = req.cookies.get('flmmkr_device_mac')?.value;
  const headerMac = req.headers.get('x-device-mac');
  const macAddress = (searchParams.get('macAddress') || headerMac || cookieMac || '').trim();

  // 3. Resolução da sessão no servidor (Prioridade 1: MAC | Prioridade 2: IP | Cooldown 36h)
  const session = await resolveOfferTimerSession({
    macAddress,
    ip,
    userAgent
  });

  const now = Date.now();
  const expiresAtTime = new Date(session.expiresAt).getTime();
  const remainingSeconds = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
  const isExpired = remainingSeconds <= 0;

  // 4. Preço baseado no lote e no estado de expiração estrito do servidor
  const batchInfo = getCurrentBatchPrice(new Date());
  const finalPrice = isExpired ? batchInfo.regularPrice : batchInfo.promoPrice;

  // 5. Resposta: Omitir deliberadamente cooldownUntil e regras de reset para proteger as regras de negócio
  const response = NextResponse.json({
    remainingSeconds,
    isExpired,
    promoPrice: batchInfo.promoPrice,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate
  });

  // Salvar cookie httpOnly / seguro com o MAC address para reforçar persistência
  if (macAddress) {
    response.cookies.set('flmmkr_device_mac', macAddress, {
      maxAge: 36 * 60 * 60, // 36 horas
      path: '/',
      sameSite: 'lax'
    });
  }

  return response;
}
