import { NextRequest, NextResponse } from 'next/server';
import { ensureNickname } from '@/lib/nickname';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId é obrigatório' }, { status: 400 });
  const nickname = await ensureNickname(userId);
  return NextResponse.json({ nickname });
}
