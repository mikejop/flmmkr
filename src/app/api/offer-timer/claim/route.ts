import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import { claimOfferTimer, hashOfferDevice, remainingOfferSeconds } from '@/utils/offerPricing';
import { getClientIp } from '@/utils/clientIp';
import { serverNow } from '@/utils/serverClock';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };

/** Clique num botão de compra: para o cronômetro da Black November da pessoa (decidido no servidor). */
export async function POST(req: NextRequest) {
  // Só aceita chamadas feitas pela própria página.
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) {
    return NextResponse.json({ error: 'Requisição inválida.' }, { status: 403, headers: NO_STORE });
  }

  const cookie = req.cookies.get('flmmkr_offer_session')?.value || '';
  if (!/^[a-f0-9-]{36}$/i.test(cookie)) {
    return NextResponse.json({ error: 'Recarregue a página para validar a oferta.' }, { status: 409, headers: NO_STORE });
  }

  const now = serverNow(req);
  const ip = getClientIp(req);
  try {
    const session = await claimOfferTimer(createHash('sha256').update(cookie).digest('hex'), ip, {
      now,
      deviceHash: hashOfferDevice(ip, req.headers.get('user-agent')),
    });
    return NextResponse.json({
      remainingSeconds: remainingOfferSeconds(session, serverNow(req)),
      isExpired: session.isExpired,
      isClaimed: Boolean(session.claimedAt),
    }, { headers: NO_STORE });
  } catch {
    return NextResponse.json({ error: 'Não foi possível validar a oferta agora.' }, { status: 503, headers: NO_STORE });
  }
}
