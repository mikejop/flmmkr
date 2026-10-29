import { NextRequest, NextResponse } from 'next/server';
import { DEV_CLOCK_COOKIE, isDevClockEnabled } from '@/utils/serverClock';

export const dynamic = 'force-dynamic';

/**
 * Só em `next dev`: simula a hora do servidor para testar a Black November.
 * /api/dev/clock?at=2026-10-30T12:29:50-03:00 (adianta o relógio até lá; o tempo continua correndo)
 * /api/dev/clock?reset=1 (volta para a hora real)
 * Acrescente &newVisitor=1 para apagar o cookie da oferta e entrar como pessoa nova.
 */
export async function GET(req: NextRequest) {
  if (!isDevClockEnabled()) return new NextResponse(null, { status: 404 });
  const params = req.nextUrl.searchParams;
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  if (params.get('newVisitor')) res.cookies.delete('flmmkr_offer_session');
  if (params.get('reset')) {
    res.cookies.delete(DEV_CLOCK_COOKIE);
    return res;
  }
  const at = Date.parse(params.get('at') || '');
  if (!Number.isFinite(at)) {
    if (params.get('newVisitor')) return res;
    return NextResponse.json({ error: 'Use ?at=ISO, ?reset=1 ou ?newVisitor=1' }, { status: 400 });
  }
  res.cookies.set(DEV_CLOCK_COOKIE, String(at - Date.now()), { path: '/', httpOnly: true, sameSite: 'lax' });
  return res;
}
