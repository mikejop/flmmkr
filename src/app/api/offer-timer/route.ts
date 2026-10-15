import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomUUID } from 'node:crypto';
import {
  getCurrentBatchPrice,
  resolveOfferTimerSession
} from '@/utils/offerPricing';
import { createExpiredOfferToken } from '@/utils/promoToken';
import { getClientIp } from '@/utils/clientIp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const batchInfo = getCurrentBatchPrice(new Date());
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
    });
  }

  const existingCookie = req.cookies.get('flmmkr_offer_session')?.value || '';
  const rawIdentifier = /^[a-f0-9-]{36}$/i.test(existingCookie) ? existingCookie : randomUUID();
  const clientIdentifier = createHash('sha256').update(rawIdentifier).digest('hex');
  let session;
  try {
    session = await resolveOfferTimerSession(clientIdentifier, getClientIp(req));
  } catch {
    return NextResponse.json({ error: 'Não foi possível carregar a oferta.' }, { status: 503 });
  }

  const now = Date.now();
  const expiresAtTime = new Date(session.expiresAt).getTime();
  const remainingSeconds = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
  const isExpired = remainingSeconds <= 0;

  const finalPrice = isExpired ? batchInfo.currentBatchPrice : batchInfo.promoPrice;

  // 5. Resposta: Omitir deliberadamente cooldownUntil e regras de reset para proteger as regras de negócio
  const response = NextResponse.json({
    remainingSeconds,
    isExpired,
    isLaunchPhase: false,
    promoPrice: batchInfo.promoPrice,
    currentBatchPrice: batchInfo.currentBatchPrice,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate,
  });

  const expiredOfferToken = isExpired ? createExpiredOfferToken(Date.now() + 36 * 60 * 60 * 1000) : null;
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
