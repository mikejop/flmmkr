import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { requireActiveStudent } from '@/utils/supabase/access';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const likeSchema = z.object({ commentId: z.string().uuid() }).strict();

export async function POST(req: NextRequest) {
  try {
    const gate = await requireActiveStudent();
    if (!gate.ok) return gate.response;
    const userId = gate.student.user.id;

    const allowed = await consumeUserRateLimit(userId, 'comments-like', 60, 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
    if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429, headers: NO_STORE });

    const parsed = likeSchema.safeParse(await readJsonLimited(req, 1024));
    if (!parsed.success) return NextResponse.json({ error: 'Comentário inválido.' }, { status: 400, headers: NO_STORE });
    const { commentId } = parsed.data;

    const { data: comment, error: fetchErr } = await supabaseAdmin
      .from('lesson_comments')
      .select('id, likes_count, liked_by')
      .eq('id', commentId)
      .maybeSingle();
    if (fetchErr || !comment) return NextResponse.json({ error: 'Comentário não encontrado.' }, { status: 404, headers: NO_STORE });

    const likedBy: string[] = Array.isArray(comment.liked_by) ? [...comment.liked_by] : [];
    const hasLiked = likedBy.includes(userId);
    const newLikedBy = hasLiked ? likedBy.filter((id) => id !== userId) : [...likedBy, userId];
    const newLikesCount = newLikedBy.length;

    const { error: updateErr } = await supabaseAdmin
      .from('lesson_comments')
      .update({ likes_count: newLikesCount, liked_by: newLikedBy, updated_at: new Date().toISOString() })
      .eq('id', commentId);
    if (updateErr) {
      console.error('Erro ao atualizar curtida:', updateErr.message);
      return NextResponse.json({ error: 'Não foi possível registrar a curtida.' }, { status: 500, headers: NO_STORE });
    }

    return NextResponse.json({ success: true, liked: !hasLiked, likesCount: newLikesCount }, { headers: NO_STORE });
  } catch (err) {
    console.error('Erro na rota de like:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500, headers: NO_STORE });
  }
}
