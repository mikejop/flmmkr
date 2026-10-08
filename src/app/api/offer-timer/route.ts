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

  const batchInfo = getCurrentBatchPrice(new Date());

  // Verificação estrita de IP para modo de teste
  const AUTHORIZED_TEST_IPS = ['168.90.209.157', '138.118.162.182', '127.0.0.1', '::1'];
  const isTestUserIp = AUTHORIZED_TEST_IPS.includes(ip);
  const testPaymentUrl = isTestUserIp ? 'https://www.asaas.com/000/c/2lrie17dp1qnzcr3' : undefined;
  const testPrice = isTestUserIp ? 5.0 : undefined;

  // Se estiver na Fase de Lançamento (até 09/10 às 23:59:59):
  // R$ 95 garantido sem cronômetro de 15 minutos contando/expirando (ou testPrice se for IP autorizado)
  if (batchInfo.isLaunchPhase) {
    const effectivePromo = isTestUserIp && testPrice ? testPrice : 95;
    const response = NextResponse.json({
      remainingSeconds: 0,
      isExpired: false,
      isLaunchPhase: true,
      promoPrice: effectivePromo,
      currentBatchPrice: effectivePromo,
      regularPrice: batchInfo.regularPrice,
      finalPrice: effectivePromo,
      batchName: isTestUserIp ? 'Modo de Teste (IP Autorizado)' : batchInfo.batchName,
      nextPriceDate: batchInfo.nextPriceDate,
      isTestUserIp,
      testPaymentUrl,
      testPrice,
      clientIp: isTestUserIp ? ip : undefined
    });

    if (macAddress) {
      response.cookies.set('flmmkr_device_mac', macAddress, {
        maxAge: 36 * 60 * 60,
        path: '/',
        sameSite: 'lax'
      });
    }

    return response;
  }

  // Pós-Lançamento (a partir de 10/10):
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

  // Enquanto dentro dos 15 minutos: R$ 95 (ou testPrice se for IP autorizado)
  // Após expirar: preço vigente do momento (R$ 125 até 13/10; R$ 150 até 17/10; R$ 195 após 18/10)
  const effectivePromo = isTestUserIp && testPrice ? testPrice : batchInfo.promoPrice;
  const effectiveBatch = isTestUserIp && testPrice ? testPrice : batchInfo.currentBatchPrice;
  const finalPrice = isTestUserIp && testPrice ? testPrice : (isExpired ? batchInfo.currentBatchPrice : batchInfo.promoPrice);

  // 5. Resposta: Omitir deliberadamente cooldownUntil e regras de reset para proteger as regras de negócio
  const response = NextResponse.json({
    remainingSeconds,
    isExpired,
    isLaunchPhase: false,
    promoPrice: effectivePromo,
    currentBatchPrice: effectiveBatch,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: isTestUserIp ? 'Modo de Teste (IP Autorizado)' : batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate,
    isTestUserIp,
    testPaymentUrl,
    testPrice,
    clientIp: isTestUserIp ? ip : undefined
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
