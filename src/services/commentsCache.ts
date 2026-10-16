import 'server-only';
import { revalidateTag, unstable_cache } from 'next/cache';
import { supabaseAdmin } from '@/utils/supabase/admin';

/** Comentário PÚBLICO, igual para todos os alunos. Sem user_id, sem liked_by, nada que dependa de quem está vendo. */
export interface SharedComment {
  id: string;
  parent_id: string | null;
  content: string;
  is_public: true;
  created_at: string;
  user_name: string;
  user_nickname: string | null;
  user_avatar: string | null;
  likes_count: number;
}

export const commentsTag = (lessonId: string) => `comments:${lessonId}`;

async function loadPublicComments(lessonId: string): Promise<SharedComment[]> {
  const { data, error } = await supabaseAdmin
    .from('lesson_comments')
    .select('id, parent_id, user_id, user_name, user_avatar, content, likes_count, created_at')
    .eq('lesson_id', lessonId)
    .eq('is_public', true)
    .order('created_at', { ascending: true })
    .limit(1000);
  if (error) throw new Error(error.message);

  const rows = data || [];
  const authorIds = Array.from(new Set(rows.map((r) => r.user_id).filter(Boolean)));
  const nickById = new Map<string, string>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabaseAdmin.from('profiles').select('id, nickname').in('id', authorIds);
    (authors || []).forEach((a) => { if (a.nickname) nickById.set(a.id, a.nickname); });
  }

  // user_id sai aqui: o cache compartilhado só guarda campos públicos.
  return rows.map((r) => ({
    id: r.id,
    parent_id: r.parent_id,
    content: r.content,
    is_public: true as const,
    created_at: r.created_at,
    user_name: r.user_name,
    user_nickname: nickById.get(r.user_id) || null,
    user_avatar: r.user_avatar,
    likes_count: r.likes_count ?? 0,
  }));
}

/**
 * Lista pública de comentários da aula em cache compartilhado (tag `comments:<lessonId>`, 5 min de segurança).
 * A chave inclui só o lessonId: nenhum dado do usuário entra aqui.
 */
export function getSharedPublicComments(lessonId: string): Promise<SharedComment[]> {
  return unstable_cache(loadPublicComments, ['comments-public-v1', lessonId], {
    tags: [commentsTag(lessonId)],
    revalidate: 300,
  })(lessonId);
}

/** Invalida a lista da aula na hora (criar, apagar, curtir, descurtir). */
export function invalidateComments(lessonId: string): void {
  try {
    revalidateTag(commentsTag(lessonId), { expire: 0 });
  } catch (err) {
    console.error('[comments-cache] falha ao invalidar', err instanceof Error ? err.message : err);
  }
}
