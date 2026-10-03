import { NextRequest, NextResponse } from 'next/server';
import { getCurrentBatchPrice, saveSessionToSupabase } from '@/utils/offerPricing';

// Armazenamento em memória do servidor (será conectado ao Supabase futuramente)
const timerStore = new Map<string, { firstAccessAt: number; expiresAt: number; ip: string; clientIdentifier: string }>();

const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const { searchParams } = new URL(req.url);
  const clientIdentifier = searchParams.get('clientId') || ip;

  const key = `${ip}_${clientIdentifier}`;
  const now = Date.now();

  let session = timerStore.get(key);

  if (!session) {
    // Primeiro acesso
    const firstAccessAt = now;
    const expiresAt = now + TIMER_DURATION_MS;
    session = { firstAccessAt, expiresAt, ip, clientIdentifier };
    timerStore.set(key, session);

    // Preparado para gravar no Supabase
    await saveSessionToSupabase({
      ip,
      clientIdentifier,
      userAgent,
      firstAccessAt: new Date(firstAccessAt).toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      isExpired: false
    });
  }

  const remainingSeconds = Math.max(0, Math.floor((session.expiresAt - now) / 1000));
  const isExpired = remainingSeconds <= 0;

  const batchInfo = getCurrentBatchPrice(new Date());
  const finalPrice = isExpired ? batchInfo.regularPrice : batchInfo.promoPrice;

  return NextResponse.json({
    ip,
    clientIdentifier,
    remainingSeconds,
    isExpired,
    promoPrice: batchInfo.promoPrice,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate,
    firstAccessAt: new Date(session.firstAccessAt).toISOString(),
    expiresAt: new Date(session.expiresAt).toISOString()
  });
}
