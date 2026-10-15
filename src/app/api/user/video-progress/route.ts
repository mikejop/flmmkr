import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { findLessonVideo } from '@/config/lessonVideos';
import { mergeProgress, sanitizeProgress, sumRanges, type VideoProgress } from '@/lib/videoProgressCore';

export const dynamic = 'force-dynamic';

const MAX_ITEMS = 8;
const MAX_BODY_BYTES = 64 * 1024;

type Row = {
  video_id: string; lesson_id: string; position: number; max_position: number; duration: number;
  ranges: VideoProgress['ranges']; stats: VideoProgress['stats']; completed_at: string | null; updated_at: string;
};

const fromRow = (r: Row): VideoProgress | null =>
  sanitizeProgress({
    videoId: r.video_id, lessonId: r.lesson_id, position: r.position, maxPosition: r.max_position, duration: r.duration,
    ranges: r.ranges, stats: r.stats, completed: !!r.completed_at, updatedAt: Date.parse(r.updated_at) || 0,
  });

/** Lê o progresso do aluno nos vídeos pedidos (?videos=id1,id2) — 1 consulta. */
export async function GET(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const ids = (req.nextUrl.searchParams.get('videos') || '').split(',').filter((id) => id && findLessonVideo(id)).slice(0, 20);
  if (!ids.length) return NextResponse.json({ items: [] });

  const { data, error } = await supabaseAdmin
    .from('user_video_progress')
    .select('video_id,lesson_id,position,max_position,duration,ranges,stats,completed_at,updated_at')
    .eq('user_id', user.id)
    .in('video_id', ids);
  if (error) return NextResponse.json({ error: 'Erro ao ler progresso.' }, { status: 500 });

  return NextResponse.json({ items: (data as Row[]).map(fromRow).filter(Boolean) });
}

/** Recebe lotes de registros do navegador e mescla com o que já existe (nunca perde dado). */
export async function POST(req: NextRequest) {
  const { user } = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const text = await req.text();
  if (text.length > MAX_BODY_BYTES) return NextResponse.json({ error: 'Corpo grande demais.' }, { status: 413 });
  let body: { items?: unknown };
  try { body = JSON.parse(text); } catch { return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 }); }

  const incoming = (Array.isArray(body.items) ? body.items.slice(0, MAX_ITEMS) : [])
    .map(sanitizeProgress)
    .filter((p): p is VideoProgress => !!p && !!findLessonVideo(p.videoId));
  if (!incoming.length) return NextResponse.json({ ok: true, saved: 0 });

  const { data: existing, error: readErr } = await supabaseAdmin
    .from('user_video_progress')
    .select('video_id,lesson_id,position,max_position,duration,ranges,stats,completed_at,updated_at')
    .eq('user_id', user.id)
    .in('video_id', incoming.map((p) => p.videoId));
  if (readErr) return NextResponse.json({ error: 'Erro ao ler progresso.' }, { status: 500 });

  const byId = new Map((existing as Row[]).map((r) => [r.video_id, fromRow(r)]));
  const now = new Date().toISOString();
  const rows = incoming.map((p) => {
    const m = mergeProgress(byId.get(p.videoId) || undefined, p);
    return {
      user_id: user.id,
      video_id: m.videoId,
      lesson_id: m.lessonId,
      position: Math.round(m.position),
      max_position: Math.round(m.maxPosition),
      duration: Math.round(m.duration),
      watched_seconds: Math.round(sumRanges(m.ranges)),
      ranges: m.ranges,
      stats: m.stats,
      completed_at: m.completed ? (existing as Row[]).find((r) => r.video_id === m.videoId)?.completed_at || now : null,
      updated_at: now,
    };
  });

  // Um único upsert para o lote inteiro.
  const { error } = await supabaseAdmin.from('user_video_progress').upsert(rows, { onConflict: 'user_id,video_id' });
  if (error) return NextResponse.json({ error: 'Erro ao salvar progresso.' }, { status: 500 });
  return NextResponse.json({ ok: true, saved: rows.length });
}
