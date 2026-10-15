import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getMediaUrl } from '@/lib/storage';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { requireActiveStudent } from '@/utils/supabase/access';
import { consumeUserRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { getSharedPublicComments, invalidateComments, type SharedComment } from '@/services/commentsCache';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'private, no-store' };
const MAX_CONTENT = 2000;
const MAX_MENTIONS = 5;
const COMMENTS_PER_MINUTE = 5;
const ID = /^[A-Za-z0-9_-]{1,64}$/;

const createSchema = z.object({
  lessonId: z.string().regex(ID),
  moduleId: z.string().regex(ID).nullish(),
  content: z.string().trim().min(1).max(MAX_CONTENT),
  isPublic: z.boolean().default(true),
  parentId: z.string().uuid().nullish(),
}).strict();

type CommentRow = {
  id: string; parent_id: string | null; user_id: string; user_name: string; user_avatar: string | null;
  content: string; is_public: boolean; likes_count: number; liked_by: string[] | null; created_at: string;
};

interface PublicComment {
  id: string;
  parent_id: string | null;
  content: string;
  is_public: boolean;
  created_at: string;
  user_name: string;
  user_nickname: string | null;
  user_avatar: string | null;
  likes_count: number;
  liked_by_me: boolean;
  is_mine: boolean;
  replies: PublicComment[];
}

/** Só o que o navegador precisa: sem user_id e sem a lista de quem curtiu. */
function toPublic(row: CommentRow, viewerId: string, nickname: string | null): PublicComment {
  return {
    id: row.id,
    parent_id: row.parent_id,
    content: row.content,
    is_public: row.is_public,
    created_at: row.created_at,
    user_name: row.user_name,
    user_nickname: nickname,
    user_avatar: row.user_avatar,
    likes_count: row.likes_count,
    liked_by_me: Array.isArray(row.liked_by) && row.liked_by.includes(viewerId),
    is_mine: row.user_id === viewerId,
    replies: [],
  };
}

export async function GET(req: NextRequest) {
  try {
    const gate = await requireActiveStudent();
    if (!gate.ok) return gate.response;
    const { user, profile } = gate.student;

    const lessonId = new URL(req.url).searchParams.get('lessonId') || '';
    if (!ID.test(lessonId)) return NextResponse.json({ error: 'Aula inválida.' }, { status: 400, headers: NO_STORE });

    const isAdmin = profile.role === 'admin';

    let visible: PublicComment[];
    let totalPublicCount: number;
    let totalPrivateCount: number;
    try {
      if (isAdmin) {
        // Administrador vê tudo (inclusive privados de outros): consulta direta, fora do cache compartilhado.
        const { data: allComments, error } = await supabaseAdmin
          .from('lesson_comments')
          .select('id, parent_id, user_id, user_name, user_avatar, content, is_public, likes_count, liked_by, created_at')
          .eq('lesson_id', lessonId)
          .order('created_at', { ascending: true })
          .limit(1000);
        if (error) throw new Error(error.message);
        const rows = (allComments || []) as CommentRow[];
        const authorIds = Array.from(new Set(rows.map((c) => c.user_id).filter(Boolean)));
        const nickById = new Map<string, string>();
        if (authorIds.length > 0) {
          const { data: authors } = await supabaseAdmin.from('profiles').select('id, nickname').in('id', authorIds);
          (authors || []).forEach((a) => { if (a.nickname) nickById.set(a.id, a.nickname); });
        }
        visible = rows.map((c) => toPublic(c, user.id, nickById.get(c.user_id) || null));
        totalPublicCount = rows.filter((c) => c.is_public).length;
        totalPrivateCount = rows.filter((c) => !c.is_public).length;
      } else {
        // Aluno: lista pública do cache compartilhado + consulta pequena só do que é dele (privados, is_mine, liked_by_me).
        const shared: SharedComment[] = await getSharedPublicComments(lessonId);
        const { data: mineRows, error: mineError } = await supabaseAdmin
          .from('lesson_comments')
          .select('id, parent_id, user_id, user_name, user_avatar, content, is_public, likes_count, liked_by, created_at')
          .eq('lesson_id', lessonId)
          .eq('user_id', user.id)
          .limit(500);
        if (mineError) throw new Error(mineError.message);
        const mine = (mineRows || []) as CommentRow[];
        const mineIds = new Set(mine.map((c) => c.id));

        const pageIds = shared.map((c) => c.id);
        const likedIds = new Set<string>();
        if (pageIds.length > 0) {
          const { data: likedRows, error: likedError } = await supabaseAdmin
            .from('lesson_comments')
            .select('id')
            .in('id', pageIds)
            .contains('liked_by', [user.id]);
          if (likedError) throw new Error(likedError.message);
          (likedRows || []).forEach((r) => likedIds.add(r.id));
        }

        const publicView: PublicComment[] = shared.map((c) => ({
          ...c,
          liked_by_me: likedIds.has(c.id),
          is_mine: mineIds.has(c.id),
          replies: [],
        }));
        const myPrivate = mine.filter((c) => !c.is_public).map((c) => toPublic(c, user.id, null));
        visible = [...publicView, ...myPrivate];
        totalPublicCount = shared.length;
        totalPrivateCount = myPrivate.length;
      }
    } catch (loadError) {
      console.error('Erro ao buscar comentários:', loadError instanceof Error ? loadError.message : loadError);
      return NextResponse.json({ error: 'Não foi possível carregar os comentários.' }, { status: 500, headers: NO_STORE });
    }

    const byId = new Map<string, PublicComment>();
    visible.forEach((c) => byId.set(c.id, c));
    const roots: PublicComment[] = [];
    visible.forEach((current) => {
      const parent = current.parent_id ? byId.get(current.parent_id) : undefined;
      if (parent) parent.replies.push(current);
      else roots.push(current);
    });
    roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return NextResponse.json({
      comments: roots,
      totalPublicCount,
      totalPrivateCount,
      totalVisibleCount: visible.length,
      total: visible.length,
      isAdmin,
    }, { headers: NO_STORE });
  } catch (err) {
    console.error('Erro geral em GET /api/comments:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Erro ao processar comentários.' }, { status: 500, headers: NO_STORE });
  }
}

export async function POST(req: NextRequest) {
  try {
    const gate = await requireActiveStudent();
    if (!gate.ok) return gate.response;
    const { user, profile: prof } = gate.student;
    const userId = user.id;

    // 5 comentários por minuto por aluno (contagem atômica no banco). Sem o segredo do limitador, recusa.
    const allowed = await consumeUserRateLimit(userId, 'comments-post', COMMENTS_PER_MINUTE, 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503, headers: NO_STORE });
    if (!allowed) return NextResponse.json({ error: 'Muitos comentários em pouco tempo. Aguarde um minuto.' }, { status: 429, headers: NO_STORE });

    const raw = await readJsonLimited(req, 16 * 1024);
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: `Comentário inválido. Use de 1 a ${MAX_CONTENT} caracteres.` }, { status: 400, headers: NO_STORE });
    }
    const { lessonId, moduleId, content, isPublic, parentId } = parsed.data;

    // REGRA DE SEGURANÇA E COMUNIDADE: Não é permitido colocar links nos comentários
    const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|io|edu|gov|tv|site|app|dev|me|br|xyz)[^\s]*)/i;
    if (URL_REGEX.test(content)) {
      return NextResponse.json(
        { error: 'Não é permitido incluir links nos comentários. Por favor, envie sua mensagem sem links externos.' },
        { status: 400, headers: NO_STORE }
      );
    }

    // Menções: no máximo 5 pessoas por comentário (evita disparar notificações em massa).
    const mentionMatches: string[] = content.match(/@([a-zA-Z0-9_]+)/g) || [];
    const nicknames = Array.from(new Set(mentionMatches.map((m) => m.slice(1).toLowerCase())));
    if (nicknames.length > MAX_MENTIONS) {
      return NextResponse.json({ error: `Mencione no máximo ${MAX_MENTIONS} pessoas por comentário.` }, { status: 400, headers: NO_STORE });
    }

    // A resposta só vale para um comentário da mesma aula.
    if (parentId) {
      const { data: parent } = await supabaseAdmin.from('lesson_comments').select('lesson_id').eq('id', parentId).maybeSingle();
      if (!parent || parent.lesson_id !== lessonId) {
        return NextResponse.json({ error: 'Comentário original não encontrado.' }, { status: 400, headers: NO_STORE });
      }
    }

    const userName = prof?.full_name || prof?.first_name || 'Aluno';
    const userAvatar = prof?.avatar_url || getMediaUrl('banners/hero_01.webp');

    const { data: newComment, error: insertError } = await supabaseAdmin
      .from('lesson_comments')
      .insert({
        lesson_id: lessonId,
        module_id: moduleId || null,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        parent_id: parentId || null,
        content,
        is_public: isPublic,
        likes_count: 0,
        liked_by: [],
      })
      .select('id, parent_id, user_id, user_name, user_avatar, content, is_public, likes_count, liked_by, created_at')
      .single();

    if (insertError || !newComment) {
      console.error('Erro ao inserir comentário:', insertError?.message);
      return NextResponse.json({ error: 'Não foi possível publicar o comentário.' }, { status: 500, headers: NO_STORE });
    }

    // 3. Notificações (menções por @nickname e resposta ao autor do comentário pai)
    try {
      const preview = `${content.slice(0, 120)}${content.length > 120 ? '...' : ''}`;
      const notifiedIds = new Set<string>([userId]); // nunca notificar a si mesmo / evitar duplicidade

      // 3.1 Menções: casamento EXATO com o nickname do aluno (somente em comentários públicos)
      if (isPublic) {
        if (nicknames.length > 0) {
          const { data: mentioned } = await supabaseAdmin
            .from('profiles')
            .select('id, nickname')
            .in('nickname', nicknames);

          for (const p of mentioned || []) {
            if (notifiedIds.has(p.id)) continue;
            notifiedIds.add(p.id);
            await supabaseAdmin.from('user_notifications').insert({
              user_id: p.id,
              type: 'mention',
              title: `${userName} marcou você`,
              message: `"${preview}"`,
              lesson_id: lessonId,
              module_id: moduleId || null,
              comment_id: newComment.id,
              sender_id: userId,
              sender_name: userName,
              sender_avatar: userAvatar,
              is_read: false,
            });
          }
        }
      }

      // 3.2 Resposta em thread: notificar o autor do comentário pai (se ainda não foi notificado)
      if (parentId) {
        const { data: parentComment } = await supabaseAdmin
          .from('lesson_comments')
          .select('user_id')
          .eq('id', parentId)
          .maybeSingle();

        if (parentComment?.user_id && !notifiedIds.has(parentComment.user_id)) {
          await supabaseAdmin.from('user_notifications').insert({
            user_id: parentComment.user_id,
            type: 'reply',
            title: `${userName} respondeu ao seu comentário`,
            message: `"${preview}"`,
            lesson_id: lessonId,
            module_id: moduleId || null,
            comment_id: newComment.id,
            sender_id: userId,
            sender_name: userName,
            sender_avatar: userAvatar,
            is_read: false,
          });
        }
      }
    } catch (notifErr) {
      console.warn('Erro ao disparar notificações:', notifErr);
    }

    if (isPublic) invalidateComments(lessonId);

    return NextResponse.json({
      success: true,
      comment: toPublic(newComment as CommentRow, userId, null),
    }, { headers: NO_STORE });
  } catch (err) {
    console.error('Erro em POST /api/comments:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Erro ao criar comentário.' }, { status: 500, headers: NO_STORE });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const commentId = new URL(req.url).searchParams.get('id');
    const { user } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: NO_STORE });
    if (!commentId || !z.string().uuid().safeParse(commentId).success) {
      return NextResponse.json({ error: 'Comentário inválido.' }, { status: 400, headers: NO_STORE });
    }

    const { data: comment, error: fetchErr } = await supabaseAdmin
      .from('lesson_comments').select('id, user_id, lesson_id, is_public').eq('id', commentId).maybeSingle();
    if (fetchErr || !comment) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404, headers: NO_STORE });

    // Regra: apenas o dono do comentário pode excluí-lo
    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: 'Apenas o autor pode excluir este comentário.' }, { status: 403, headers: NO_STORE });
    }

    // Respostas são apagadas em cascata pelo ON DELETE CASCADE.
    const { error: delErr } = await supabaseAdmin.from('lesson_comments').delete().eq('id', commentId);
    if (delErr) {
      console.error('Erro ao excluir comentário:', delErr.message);
      return NextResponse.json({ error: 'Não foi possível excluir o comentário.' }, { status: 500, headers: NO_STORE });
    }
    invalidateComments(comment.lesson_id);
    return NextResponse.json({ success: true, message: 'Comentário excluído com sucesso.' }, { headers: NO_STORE });
  } catch (err) {
    console.error('Erro em DELETE /api/comments:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Erro ao excluir comentário.' }, { status: 500, headers: NO_STORE });
  }
}
