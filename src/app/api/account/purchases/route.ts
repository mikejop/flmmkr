import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { consumeUserRateLimit } from '@/utils/rateLimit';
import { getUserPurchases } from '@/services/purchases';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };

/** Compras do aluno logado. Datas, prazo e elegibilidade vêm do servidor (o cliente só exibe). */
export async function GET() {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: NO_STORE });

  const allowed = await consumeUserRateLimit(user.id, 'account-purchases', 30, 60);
  if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429, headers: NO_STORE });

  try {
    const purchases = await getUserPurchases(user.id);
    return NextResponse.json({ purchases, serverNow: new Date().toISOString() }, { headers: NO_STORE });
  } catch (err) {
    console.error('[account/purchases]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Não foi possível carregar suas compras agora.' }, { status: 500, headers: NO_STORE });
  }
}
