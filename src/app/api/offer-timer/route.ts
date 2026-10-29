import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import {
  getCurrentBatchPrice,
  hashOfferDevice,
  remainingOfferSeconds,
  resolveOfferTimerSession,
  BLACK_NOVEMBER_START_ISO,
  BLACK_NOVEMBER_END_ISO,
} from '@/utils/offerPricing';
import { createExpiredOfferToken } from '@/utils/promoToken';
import { getClientIp } from '@/utils/clientIp';
import { serverNow } from '@/utils/serverClock';

export const dynamic = 'force-dynamic';

const blackNovember = { startsAt: BLACK_NOVEMBER_START_ISO, endsAt: BLACK_NOVEMBER_END_ISO };

export async function GET(req: NextRequest) {
  const now = serverNow(req);
  const batchInfo = getCurrentBatchPrice(new Date(now));
  if (batchInfo.isLaunchPhase) {
    return NextResponse.json({
      remainingSeconds: 0,
      isExpired: false,
      isLaunchPhase: true,
      promoPrice: batchInfo.promoPrice,
      currentBatchPrice: batchInfo.currentBatchPrice,
      regularPrice: batchInfo.regularPrice,
      finalPrice: batchInfo.promoPrice,
      batchName: batchInfo.batchName,
      nextPriceDate: batchInfo.nextPriceDate,
      timerMinutes: 0,
      promoPercentOffBatch: batchInfo.promoPercentOffBatch,
      promoPercentOffRegular: batchInfo.promoPercentOffRegular,
      batchPercentOffRegular: batchInfo.batchPercentOffRegular,
      serverNow: now,
      blackNovember,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
  }

  const existingCookie = req.cookies.get('flmmkr_offer_session')?.value || '';
  const rawIdentifier = /^[a-f0-9-]{36}$/i.test(existingCookie) ? existingCookie : randomUUID();
  const clientIdentifier = createHash('sha256').update(rawIdentifier).digest('hex');
  const ip = getClientIp(req);
  let session;
  try {
    session = await resolveOfferTimerSession(clientIdentifier, ip, {
      now,
      deviceHash: hashOfferDevice(ip, req.headers.get('user-agent')),
    });
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar a oferta.' }, { status: 503 });
  }

  // Hora de novo depois de gravar: o tempo restante vale para o momento da resposta.
  const remainingSeconds = remainingOfferSeconds(session, serverNow(req));
  const isExpired = session.isExpired;
  const isBlackNovember = batchInfo.phaseId === 'black';

  const finalPrice = isExpired ? batchInfo.currentBatchPrice : batchInfo.promoPrice;

  // 5. Resposta: Omitir deliberadamente cooldownUntil e regras de reset para proteger as regras de negócio
  const response = NextResponse.json({
    remainingSeconds,
    isExpired,
    isClaimed: Boolean(session.claimedAt),
    isLaunchPhase: false,
    isBlackNovember,
    promoPrice: batchInfo.promoPrice,
    currentBatchPrice: batchInfo.currentBatchPrice,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate,
    timerMinutes: batchInfo.timerMinutes,
    promoPercentOffBatch: batchInfo.promoPercentOffBatch,
    promoPercentOffRegular: batchInfo.promoPercentOffRegular,
    batchPercentOffRegular: batchInfo.batchPercentOffRegular,
    serverNow: now,
    blackNovember,
  }, { headers: { 'Cache-Control': 'private, no-store' } });

  // Na Black November não existe o desconto de 25% depois que o tempo acaba: volta para R$ 195.
  const expiredOfferToken = isExpired && !isBlackNovember ? createExpiredOfferToken(Date.now() + 36 * 60 * 60 * 1000) : null;
  if (expiredOfferToken) {
    response.cookies.set('flmmkr_discount_25', expiredOfferToken, {
      maxAge: 36 * 60 * 60,
      path: '/',
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }

  response.cookies.set('flmmkr_offer_session', rawIdentifier, {
    maxAge: 90 * 24 * 60 * 60,
    path: '/',
    sameSite: 'lax',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  return response;
}
