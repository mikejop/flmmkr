import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { commentId, userId } = body;

    if (!commentId || !userId) {
      return NextResponse.json(
        { error: 'commentId e userId são obrigatórios.' },
        { status: 400 }
      );
    }

    // Buscar comentário atual
    const { data: comment, error: fetchErr } = await supabaseAdmin
      .from('lesson_comments')
      .select('id, likes_count, liked_by')
      .eq('id', commentId)
      .single();

    if (fetchErr || !comment) {
      return NextResponse.json({ error: 'Comentário não encontrado.' }, { status: 404 });
    }

    let likedBy: string[] = Array.isArray(comment.liked_by) ? [...comment.liked_by] : [];
    const hasLiked = likedBy.includes(userId);

    let newLikedBy: string[];
    let newLikesCount: number;

    if (hasLiked) {
      // Descurtir
      newLikedBy = likedBy.filter((id) => id !== userId);
      newLikesCount = Math.max(0, (comment.likes_count || 1) - 1);
    } else {
      // Curtir
      newLikedBy = [...likedBy, userId];
      newLikesCount = (comment.likes_count || 0) + 1;
    }

    const { error: updateErr } = await supabaseAdmin
      .from('lesson_comments')
      .update({
        likes_count: newLikesCount,
        liked_by: newLikedBy,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (updateErr) {
      console.error('Erro ao atualizar curtida:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      liked: !hasLiked,
      likesCount: newLikesCount
    });
  } catch (err: any) {
    console.error('Erro na rota de like:', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
