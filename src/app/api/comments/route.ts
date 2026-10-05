import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonId = searchParams.get('lessonId');
    const userId = searchParams.get('userId');

    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId é obrigatório' }, { status: 400 });
    }

    // 1. Verificar se o usuário é administrador/professor
    let isAdmin = false;
    if (userId) {
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .maybeSingle();
      if (prof?.role === 'admin') {
        isAdmin = true;
      }
    }

    // 2. Buscar comentários da aula
    let query = supabaseAdmin
      .from('lesson_comments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: true });

    const { data: allComments, error } = await query;

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 3. Filtrar com base na privacidade (Público vs Privado para o Professor)
    // Se for admin: vê tudo (públicos e privados)
    // Se for aluno: vê todos os públicos + os próprios privados que ele criou
    const visibleComments = (allComments || []).filter(c => {
      if (isAdmin) return true;
      if (c.is_public) return true;
      if (userId && c.user_id === userId) return true;
      return false;
    });

    // 3.1 Buscar nicknames dos autores
    const authorIds = Array.from(new Set(visibleComments.map(c => c.user_id).filter(Boolean)));
    const nickById = new Map<string, string>();
    if (authorIds.length > 0) {
      const { data: authors } = await supabaseAdmin
        .from('profiles')
        .select('id, nickname')
        .in('id', authorIds);
      (authors || []).forEach(a => {
        if (a.nickname) nickById.set(a.id, a.nickname);
      });
    }

    // 4. Montar a árvore de tópicos (comentários raiz e respostas aninhadas)
    const commentMap = new Map<string, any>();
    const rootComments: any[] = [];

    visibleComments.forEach(c => {
      commentMap.set(c.id, { ...c, user_nickname: nickById.get(c.user_id) || null, replies: [] });
    });

    visibleComments.forEach(c => {
      const current = commentMap.get(c.id);
      if (c.parent_id && commentMap.has(c.parent_id)) {
        commentMap.get(c.parent_id).replies.push(current);
      } else {
        rootComments.push(current);
      }
    });

    // Inverter ordem dos comentários raiz para exibir os mais recentes no topo
    rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Contadores para a interface
    const totalPublicCount = (allComments || []).filter(c => c.is_public).length;
    const totalPrivateCount = (allComments || []).filter(c => !c.is_public && (isAdmin || c.user_id === userId)).length;

    return NextResponse.json({
      comments: rootComments,
      totalPublicCount,
      totalPrivateCount,
      totalVisibleCount: visibleComments.length,
      total: visibleComments.length,
      isAdmin,
    });
  } catch (err: any) {
    console.error('Erro geral em GET /api/comments:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao processar comentários.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, moduleId, content, isPublic = true, parentId = null, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
    }

    if (!lessonId) {
      return NextResponse.json({ error: 'Identificador da aula ausente' }, { status: 400 });
    }

    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Conteúdo do comentário não pode estar vazio' }, { status: 400 });
    }

    // REGRA DE SEGURANÇA E COMUNIDADE: Não é permitido colocar links nos comentários
    const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|io|edu|gov|tv|site|app|dev|me|br|xyz)[^\s]*)/i;
    if (URL_REGEX.test(content)) {
      return NextResponse.json(
        { error: 'Não é permitido incluir links nos comentários. Por favor, envie sua mensagem sem links externos.' },
        { status: 400 }
      );
    }

    // 1. Obter informações de perfil atualizadas do usuário
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('full_name, first_name, avatar_url, role')
      .eq('id', userId)
      .maybeSingle();

    const userName = prof?.full_name || prof?.first_name || 'Aluno';
    const userAvatar = prof?.avatar_url || '/media/banners/hero_01.webp';

    // 2. Inserir comentário no banco de dados
    const { data: newComment, error: insertError } = await supabaseAdmin
      .from('lesson_comments')
      .insert({
        lesson_id: lessonId,
        module_id: moduleId || null,
        user_id: userId,
        user_name: userName,
        user_avatar: userAvatar,
        parent_id: parentId || null,
        content: content.trim(),
        is_public: isPublic,
        likes_count: 0,
        liked_by: [],
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao inserir comentário:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // 3. Notificações (menções por @nickname e resposta ao autor do comentário pai)
    try {
      const preview = `${content.trim().slice(0, 120)}${content.trim().length > 120 ? '...' : ''}`;
      const notifiedIds = new Set<string>([userId]); // nunca notificar a si mesmo / evitar duplicidade

      // 3.1 Menções: casamento EXATO com o nickname do aluno (somente em comentários públicos)
      if (isPublic) {
        const mentionMatches: string[] = content.match(/@([a-zA-Z0-9_]+)/g) || [];
        const nicknames = Array.from(new Set(mentionMatches.map((m) => m.slice(1).toLowerCase())));

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

    return NextResponse.json({
      success: true,
      comment: {
        ...newComment,
        replies: [],
      },
    });
  } catch (err: any) {
    console.error('Erro em POST /api/comments:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao criar comentário.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commentId = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!commentId || !userId) {
      return NextResponse.json({ error: 'ID do comentário e ID do usuário são obrigatórios' }, { status: 400 });
    }

    // 1. Buscar o comentário
    const { data: comment, error: fetchErr } = await supabaseAdmin
      .from('lesson_comments')
      .select('*')
      .eq('id', commentId)
      .maybeSingle();

    if (fetchErr || !comment) {
      return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
    }

    // 2. Regra: apenas o dono do comentário pode excluí-lo
    if (comment.user_id !== userId) {
      return NextResponse.json({ error: 'Apenas o autor pode excluir este comentário.' }, { status: 403 });
    }

    // 3. Deletar comentário (respostas são apagadas em cascata pelo ON DELETE CASCADE)
    const { error: delErr } = await supabaseAdmin
      .from('lesson_comments')
      .delete()
      .eq('id', commentId);

    if (delErr) {
      return NextResponse.json({ error: delErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Comentário excluído com sucesso.',
    });
  } catch (err: any) {
    console.error('Erro em DELETE /api/comments:', err);
    return NextResponse.json({ error: err?.message || 'Erro ao excluir comentário.' }, { status: 500 });
  }
}
