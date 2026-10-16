import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { verifyAccessCached } from '@/services/paymentVerificationService';

export const dynamic = 'force-dynamic';

const VIDEO_BY_LESSON: Record<string, string> = {
  'mod1-1': 'https://b-vz-5bb7b1c1-d28.tv.pandavideo.com.br/e559c1ae-4471-4c85-84ab-62154cb40b9f/playlist.m3u8',
};

export async function GET(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const lessonId = new URL(req.url).searchParams.get('lessonId') || '';
  const videoUrl = VIDEO_BY_LESSON[lessonId];
  if (!videoUrl) return NextResponse.json({ error: 'Vídeo não encontrado.' }, { status: 404 });

  const access = await verifyAccessCached({ userId: user.id, email: user.email });
  if (!access.isAllowed) return NextResponse.json({ error: 'Acesso ao conteúdo não autorizado.' }, { status: 403 });

  return NextResponse.json({ videoUrl }, { headers: { 'Cache-Control': 'private, no-store, max-age=0' } });
}
