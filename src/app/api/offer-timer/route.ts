import { NextRequest, NextResponse } from 'next/server';
import {
  getCurrentBatchPrice,
  getOrUpdateSupabaseSession,
  updateSessionExpirationInSupabase,
  UserTimerRecord
} from '@/utils/offerPricing';

// Cache em memória do servidor com retenção
const memoryStore = new Map<string, UserTimerRecord>();

const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 minutos de preço promocional
const COOLDOWN_DURATION_MS = 36 * 60 * 60 * 1000; // 36 horas até poder resetar

export async function GET(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1');
  const userAgent = req.headers.get('user-agent') || 'unknown';

  const { searchParams } = new URL(req.url);
  const cookieClientId = req.cookies.get('flmmkr_offer_timer')?.value;
  const isReset = searchParams.get('reset') === '1' || searchParams.get('reset') === 'true';
  const clientIdentifier = searchParams.get('clientId') || cookieClientId || `dev_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const now = Date.now();
  const cacheKey = `sess_${clientIdentifier}_${ip}`;

  if (isReset) {
    memoryStore.delete(cacheKey);
  }

  // 1. Verificar se já existe sessão no cache de memória ou Supabase
  let session = isReset ? null : memoryStore.get(cacheKey);

  if (!session) {
    // Tenta buscar no Supabase
    const supabaseSession = await getOrUpdateSupabaseSession({
      ip,
      clientIdentifier,
      userAgent,
      firstAccessAt: new Date(now).toISOString(),
      expiresAt: new Date(now + TIMER_DURATION_MS).toISOString(),
      cooldownUntil: new Date(now + COOLDOWN_DURATION_MS).toISOString(),
      isExpired: false
    });

    if (supabaseSession) {
      session = supabaseSession;
      memoryStore.set(cacheKey, session);
    }
  }

  // 2. Se não existia, cria uma nova sessão
  if (!session) {
    const firstAccessAt = new Date(now).toISOString();
    const expiresAt = new Date(now + TIMER_DURATION_MS).toISOString();
    const cooldownUntil = new Date(now + COOLDOWN_DURATION_MS).toISOString();

    session = {
      ip,
      clientIdentifier,
      userAgent,
      firstAccessAt,
      expiresAt,
      cooldownUntil,
      isExpired: false
    };

    memoryStore.set(cacheKey, session);
  } else {
    // 3. Verificar se as 36 horas de cooldown já se passaram para resetar
    const cooldownTime = new Date(session.cooldownUntil).getTime();
    if (now >= cooldownTime) {
      // 36h passaram! Resetar o cronômetro para uma nova janela promocional
      const firstAccessAt = new Date(now).toISOString();
      const expiresAt = new Date(now + TIMER_DURATION_MS).toISOString();
      const cooldownUntil = new Date(now + COOLDOWN_DURATION_MS).toISOString();

      session = {
        ...session,
        firstAccessAt,
        expiresAt,
        cooldownUntil,
        isExpired: false
      };

      memoryStore.set(cacheKey, session);
      await getOrUpdateSupabaseSession(session);
    }
  }

  // 4. Calcular tempo restante exato a partir do expiresAt original
  const expiresAtTime = new Date(session.expiresAt).getTime();
  const remainingSeconds = Math.max(0, Math.floor((expiresAtTime - now) / 1000));
  const isExpired = remainingSeconds <= 0;

  // Atualizar flag de expiração se mudou
  if (isExpired !== session.isExpired) {
    session.isExpired = isExpired;
    memoryStore.set(cacheKey, session);
    updateSessionExpirationInSupabase(clientIdentifier, isExpired);
  }

  // 5. Preço atual do lote
  const batchInfo = getCurrentBatchPrice(new Date());
  const finalPrice = isExpired ? batchInfo.regularPrice : batchInfo.promoPrice;

  // 6. Resposta com cookie seguro de 36h
  const response = NextResponse.json({
    ip,
    clientIdentifier,
    remainingSeconds,
    isExpired,
    promoPrice: batchInfo.promoPrice,
    regularPrice: batchInfo.regularPrice,
    finalPrice,
    batchName: batchInfo.batchName,
    nextPriceDate: batchInfo.nextPriceDate,
    firstAccessAt: session.firstAccessAt,
    expiresAt: session.expiresAt,
    cooldownUntil: session.cooldownUntil
  });

  // Grava cookie no navegador com validade de 36 horas
  response.cookies.set('flmmkr_offer_timer', clientIdentifier, {
    maxAge: 36 * 60 * 60, // 36 horas em segundos
    path: '/',
    httpOnly: false,
    sameSite: 'lax'
  });

  return response;
}
