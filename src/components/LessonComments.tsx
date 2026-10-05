'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Heart,
  CornerDownRight,
  Trash2,
  Globe,
  Lock,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Users,
  AlertCircle
} from 'lucide-react';

interface CommentItem {
  id: string;
  lesson_id: string;
  module_id?: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  parent_id?: string | null;
  content: string;
  is_public: boolean;
  likes_count: number;
  liked_by?: string[];
  created_at: string;
  replies?: CommentItem[];
}

interface LessonCommentsProps {
  lessonId: string;
  moduleId?: string;
  userId?: string;
  userProfile?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    avatar?: string;
    isAdmin?: boolean;
  };
  isAdmin?: boolean;
}

export default function LessonComments({
  lessonId,
  moduleId,
  userId,
  userProfile,
  isAdmin = false
}: LessonCommentsProps) {
  // Estado para controlar abertura / fechamento da barra de comentários
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPublicList, setShowPublicList] = useState(true);

  // Estados de dados
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Novo comentário principal
  const [newCommentText, setNewCommentText] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  // Resposta inline
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);

  // Carregar comentários
  const loadComments = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const url = `/api/comments?lessonId=${encodeURIComponent(lessonId)}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ''
      }`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error('Erro ao carregar comentários:', err);
    } finally {
      setLoading(false);
    }
  }, [lessonId, userId]);

  useEffect(() => {
    loadComments();
    setNewCommentText('');
    setReplyingToId(null);
  }, [loadComments]);

  // Publicar comentário principal
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    if (!userId) {
      alert('Você precisa estar conectado para enviar um comentário.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          moduleId,
          userId,
          content: newCommentText.trim(),
          isPublic,
          parentId: null
        })
      });

      if (res.ok) {
        setNewCommentText('');
        await loadComments();
        setShowPublicList(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao publicar comentário.');
      }
    } catch (err) {
      console.error('Erro ao postar comentário:', err);
      alert('Não foi possível enviar seu comentário.');
    } finally {
      setSubmitting(false);
    }
  };

  // Publicar resposta para um comentário
  const handleReplySubmit = async (parentId: string, parentIsPublic: boolean) => {
    if (!replyText.trim() || replySubmitting) return;

    if (!userId) {
      alert('Você precisa estar conectado para responder.');
      return;
    }

    setReplySubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId,
          moduleId,
          userId,
          content: replyText.trim(),
          isPublic: parentIsPublic, // segue a mesma visibilidade do comentário pai
          parentId
        })
      });

      if (res.ok) {
        setReplyText('');
        setReplyingToId(null);
        await loadComments();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao responder comentário.');
      }
    } catch (err) {
      console.error('Erro ao responder:', err);
      alert('Falha ao enviar resposta.');
    } finally {
      setReplySubmitting(false);
    }
  };

  // Curtir / Descurtir comentário
  const handleToggleLike = async (commentId: string) => {
    if (!userId) {
      alert('Conecte-se para curtir comentários.');
      return;
    }

    // Atualização otimista
    const updateLikesInTree = (list: CommentItem[]): CommentItem[] => {
      return list.map((c) => {
        if (c.id === commentId) {
          const liked = (c.liked_by || []).includes(userId);
          const newLikedBy = liked
            ? (c.liked_by || []).filter((id) => id !== userId)
            : [...(c.liked_by || []), userId];
          const newCount = liked ? Math.max(0, c.likes_count - 1) : c.likes_count + 1;
          return { ...c, likes_count: newCount, liked_by: newLikedBy };
        }
        if (c.replies && c.replies.length > 0) {
          return { ...c, replies: updateLikesInTree(c.replies) };
        }
        return c;
      });
    };

    setComments((prev) => updateLikesInTree(prev));

    try {
      const res = await fetch('/api/comments/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId, userId })
      });
      if (!res.ok) {
        // reverter se falhar
        await loadComments();
      }
    } catch (err) {
      console.error('Erro ao curtir:', err);
      await loadComments();
    }
  };

  // Excluir comentário
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este comentário?')) return;

    try {
      const res = await fetch(`/api/comments?id=${commentId}&userId=${userId || ''}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await loadComments();
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao excluir comentário.');
      }
    } catch (err) {
      console.error('Erro ao excluir:', err);
      alert('Não foi possível excluir o comentário.');
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="w-full my-6 bg-zinc-950/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
      {/* 1. BARRA MINIMIZADA (HEADER CLICÁVEL) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-white/[0.03] transition-colors select-none group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-105 transition-transform">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold tracking-wide text-zinc-100 group-hover:text-white transition-colors">
                Comentários e Dúvidas da Aula
              </h3>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {isExpanded
                ? 'Clique para recolher o campo de comentários'
                : 'Clique para deixar um comentário ou tirar dúvidas com o professor'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
              setShowPublicList(true);
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 hover:text-orange-300 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 rounded-lg transition-all"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Ver comentários da turma ({totalCount})</span>
          </button>

          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 group-hover:text-white group-hover:bg-white/10 transition-all">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* 2. ÁREA EXPANDIDA */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-white/5 space-y-6 animate-fadeIn">
          {/* BOTÃO MOBILE PARA VER COMENTÁRIOS */}
          <div className="sm:hidden flex justify-end">
            <button
              type="button"
              onClick={() => setShowPublicList(!showPublicList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/30 rounded-lg"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ver comentários da turma ({totalCount})</span>
            </button>
          </div>

          {/* FORMULÁRIO DE NOVO COMENTÁRIO */}
          <form
            onSubmit={handleCreateComment}
            className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                Deixar sua dúvida ou comentário
              </span>

              {/* SELETOR: PÚBLICO OU NÃO PÚBLICO (PRIVADO) */}
              <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all ${
                    isPublic
                      ? 'bg-orange-500 text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Visível para todos os alunos e o professor"
                >
                  <Globe className="w-3 h-3" />
                  <span>Público</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md transition-all ${
                    !isPublic
                      ? 'bg-amber-400 text-black font-semibold shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                  title="Apenas o professor verá seu comentário no dashboard dele"
                >
                  <Lock className="w-3 h-3" />
                  <span>Apenas Professor</span>
                </button>
              </div>
            </div>

            {/* AVISO DO TIPO DE PRIVACIDADE */}
            <div className="text-[11px] flex items-center gap-1.5 text-zinc-400">
              {isPublic ? (
                <>
                  <Globe className="w-3 h-3 text-emerald-400" />
                  <span>
                    <strong>Público:</strong> visível para todos os colegas da turma e o professor.
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-3 h-3 text-amber-400" />
                  <span>
                    <strong>Não público:</strong> apenas você e o professor podem visualizar esta
                    mensagem.
                  </span>
                </>
              )}
            </div>

            {/* TEXTAREA */}
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Escreva sua dúvida, reflexão ou comentário sobre a aula..."
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-black/50 border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/60 focus:ring-1 focus:ring-orange-500/40 transition-all resize-none"
            />

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-500">
                Seja respeitoso e compartilhe aprendizados cinematográficos.
              </span>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-40 disabled:hover:bg-orange-500 transition-all shadow-lg shadow-orange-500/10 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar comentário</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* LISTA DE COMENTÁRIOS */}
          {showPublicList && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Discussão da Aula ({comments.length})
                </span>
                {loading && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Loader2 className="w-3 h-3 animate-spin text-orange-400" />
                    <span>Atualizando...</span>
                  </div>
                )}
              </div>

              {comments.length === 0 && !loading && (
                <div className="py-8 text-center text-zinc-500 text-xs">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-30 text-zinc-400" />
                  Nenhum comentário deixado nesta aula ainda. Seja o primeiro a perguntar!
                </div>
              )}

              {/* ITERAÇÃO DOS COMENTÁRIOS */}
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isAuthor = userId && comment.user_id === userId;
                  const canDelete = isAuthor || isAdmin;
                  const hasLiked = userId && (comment.liked_by || []).includes(userId);

                  return (
                    <div
                      key={comment.id}
                      className="p-4 rounded-xl bg-white/[0.015] border border-white/5 space-y-3"
                    >
                      {/* HEADER DO COMENTÁRIO */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* AVATAR */}
                          {comment.user_avatar ? (
                            <img
                              src={comment.user_avatar}
                              alt={comment.user_name}
                              className="w-8 h-8 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-xs font-bold text-zinc-300">
                              {comment.user_name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-zinc-200">
                                {comment.user_name}
                              </span>
                              {isAuthor && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                  Você
                                </span>
                              )}
                              {!comment.is_public && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  Privado (Professor)
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* BOTÃO EXCLUIR */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                            title="Excluir este comentário"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* CONTEÚDO */}
                      <p className="text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap pl-11">
                        {comment.content}
                      </p>

                      {/* AÇÕES (CURTIR, RESPONDER) */}
                      <div className="flex items-center gap-4 pl-11 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id)}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${
                            hasLiked
                              ? 'text-red-400 bg-red-500/10'
                              : 'text-zinc-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-400 text-red-400' : ''}`}
                          />
                          <span className="text-[11px] font-mono">{comment.likes_count || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                            } else {
                              setReplyingToId(comment.id);
                              setReplyText('');
                            }
                          }}
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-zinc-400 hover:text-orange-400 hover:bg-white/5 transition-colors"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span className="text-[11px]">Responder</span>
                        </button>
                      </div>

                      {/* FORMULÁRIO DE RESPOSTA INLINE */}
                      {replyingToId === comment.id && (
                        <div className="pl-11 pt-2">
                          <div className="p-3 rounded-lg bg-black/60 border border-white/10 space-y-2">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Responder para ${comment.user_name}...`}
                              rows={2}
                              className="w-full px-3 py-2 text-xs bg-black/50 border border-white/10 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500/60"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-2.5 py-1 text-xs text-zinc-400 hover:text-white rounded"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={replySubmitting || !replyText.trim()}
                                onClick={() => handleReplySubmit(comment.id, comment.is_public)}
                                className="px-3 py-1 text-xs font-medium rounded-lg bg-orange-500 hover:bg-orange-400 text-black disabled:opacity-40"
                              >
                                {replySubmitting ? 'Respondendo...' : 'Responder'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RESPOSTAS ANINHADAS (REPLIES) */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-11 pt-2 space-y-2.5 border-l-2 border-white/5 ml-4">
                          {comment.replies.map((reply) => {
                            const isReplyAuthor = userId && reply.user_id === userId;
                            const canDeleteReply = isReplyAuthor || isAdmin;
                            const replyHasLiked =
                              userId && (reply.liked_by || []).includes(userId);

                            return (
                              <div
                                key={reply.id}
                                className="p-3 rounded-lg bg-white/[0.02] border border-white/5 space-y-2"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2.5">
                                    {reply.user_avatar ? (
                                      <img
                                        src={reply.user_avatar}
                                        alt={reply.user_name}
                                        className="w-6 h-6 rounded-full object-cover border border-white/10"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                                        {reply.user_name?.charAt(0)?.toUpperCase() || 'A'}
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-medium text-zinc-200">
                                          {reply.user_name}
                                        </span>
                                        {isReplyAuthor && (
                                          <span className="text-[9px] px-1 py-0.2 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                                            Você
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[9px] text-zinc-500">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                  </div>

                                  {canDeleteReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-zinc-500 hover:text-red-400 p-1 rounded transition-colors"
                                      title="Excluir resposta"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap pl-8">
                                  {reply.content}
                                </p>

                                <div className="flex items-center gap-3 pl-8 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(reply.id)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                                      replyHasLiked
                                        ? 'text-red-400 bg-red-500/10'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        replyHasLiked ? 'fill-red-400 text-red-400' : ''
                                      }`}
                                    />
                                    <span className="text-[10px] font-mono">
                                      {reply.likes_count || 0}
                                    </span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
