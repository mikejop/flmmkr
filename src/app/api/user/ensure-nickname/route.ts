import { NextRequest, NextResponse } from 'next/server';
import { ensureNickname } from '@/lib/nickname';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  const nickname = await ensureNickname(user.id);
  return NextResponse.json({ nickname });
}
