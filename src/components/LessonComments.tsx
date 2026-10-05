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
  Users
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
          isPublic: parentIsPublic,
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
    <div className="w-full my-6 bg-white border border-neutral-300 shadow-md rounded-[24px] overflow-hidden select-text transition-all duration-300">
      {/* 1. BARRA MINIMIZADA (HEADER CLICÁVEL COM ALTO CONTRASTE) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 sm:px-8 py-5 cursor-pointer hover:bg-neutral-50 transition-colors select-none group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[#0071e3] group-hover:scale-105 group-hover:bg-[#0071e3] group-hover:text-white transition-all shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-neutral-900 group-hover:text-[#0071e3] transition-colors">
                Comentários e Dúvidas da Aula
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-800 border border-neutral-300">
                {totalCount}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-0.5">
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
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0071e3] hover:text-white bg-[#0071e3]/10 hover:bg-[#0071e3] border border-[#0071e3]/30 rounded-xl transition-all shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Ver comentários da turma ({totalCount})</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-neutral-100 border border-neutral-300 flex items-center justify-center text-neutral-700 group-hover:text-neutral-900 group-hover:bg-neutral-200 transition-all">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 2. ÁREA EXPANDIDA */}
      {isExpanded && (
        <div className="px-5 sm:px-8 pb-8 pt-4 border-t border-neutral-200 space-y-6 animate-fadeIn bg-neutral-50/50">
          {/* BOTÃO MOBILE PARA VER COMENTÁRIOS */}
          <div className="sm:hidden flex justify-end">
            <button
              type="button"
              onClick={() => setShowPublicList(!showPublicList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0071e3] bg-[#0071e3]/10 border border-[#0071e3]/30 rounded-lg"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ver comentários da turma ({totalCount})</span>
            </button>
          </div>

          {/* FORMULÁRIO DE NOVO COMENTÁRIO */}
          <form
            onSubmit={handleCreateComment}
            className="p-5 sm:p-6 rounded-2xl bg-white border border-neutral-300 shadow-sm space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#0071e3]" />
                Deixar sua dúvida ou comentário
              </span>

              {/* SELETOR: PÚBLICO OU NÃO PÚBLICO (AZUL / CINZA DE ALTO CONTRASTE) */}
              <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl border border-neutral-300">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    isPublic
                      ? 'bg-[#0071e3] text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900 font-medium'
                  }`}
                  title="Visível para todos os alunos e o professor"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Público</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPublic(false)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    !isPublic
                      ? 'bg-neutral-900 text-white font-bold shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-900 font-medium'
                  }`}
                  title="Apenas o professor verá seu comentário no dashboard dele"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Apenas Professor</span>
                </button>
              </div>
            </div>

            {/* AVISO DO TIPO DE PRIVACIDADE */}
            <div className="text-xs flex items-center gap-2 text-neutral-700 font-medium">
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 text-[#0071e3]" />
                  <span>
                    <strong className="text-neutral-900">Público:</strong> visível para todos os
                    colegas da turma e para o professor.
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-neutral-900" />
                  <span>
                    <strong className="text-neutral-900">Não público (Privado):</strong> apenas você
                    e o professor podem visualizar esta mensagem.
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
              className="w-full px-4 py-3 text-sm bg-white border border-neutral-300 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all resize-none shadow-xs font-sans leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <span className="text-xs text-neutral-500 font-medium">
                Compartilhe aprendizados e dúvidas sobre as técnicas cinematográficas.
              </span>
              <button
                type="submit"
                disabled={submitting || !newCommentText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publicando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar comentário</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* LISTA DE COMENTÁRIOS */}
          {showPublicList && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Discussão da Aula ({comments.length})
                </span>
                {loading && (
                  <div className="flex items-center gap-1.5 text-xs text-[#0071e3] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                )}
              </div>

              {comments.length === 0 && !loading && (
                <div className="py-10 text-center text-neutral-500 text-sm font-medium">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
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
                      className="p-5 rounded-2xl bg-white border border-neutral-300 shadow-sm space-y-3"
                    >
                      {/* HEADER DO COMENTÁRIO */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {/* AVATAR */}
                          {comment.user_avatar ? (
                            <img
                              src={comment.user_avatar}
                              alt={comment.user_name}
                              className="w-9 h-9 rounded-full object-cover border border-neutral-300 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-xs font-bold text-[#0071e3]">
                              {comment.user_name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-bold text-neutral-900">
                                {comment.user_name}
                              </span>
                              {isAuthor && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-bold">
                                  Você
                                </span>
                              )}
                              {!comment.is_public && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 text-white font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  Privado (Professor)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-500 font-medium">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* BOTÃO EXCLUIR */}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-neutral-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Excluir este comentário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* CONTEÚDO */}
                      <p className="text-sm leading-relaxed text-neutral-800 whitespace-pre-wrap pl-12 font-sans">
                        {comment.content}
                      </p>

                      {/* AÇÕES (CURTIR, RESPONDER) */}
                      <div className="flex items-center gap-4 pl-12 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
                            hasLiked
                              ? 'text-red-600 bg-red-50 border border-red-200 font-bold'
                              : 'text-neutral-600 hover:text-[#0071e3] hover:bg-neutral-100 border border-transparent font-medium'
                          }`}
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-600 text-red-600' : ''}`}
                          />
                          <span className="text-xs font-mono">{comment.likes_count || 0}</span>
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
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-600 hover:text-[#0071e3] hover:bg-neutral-100 transition-colors font-medium"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Responder</span>
                        </button>
                      </div>

                      {/* FORMULÁRIO DE RESPOSTA INLINE */}
                      {replyingToId === comment.id && (
                        <div className="pl-12 pt-2">
                          <div className="p-4 rounded-xl bg-neutral-100 border border-neutral-300 space-y-2.5">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder={`Responder para ${comment.user_name}...`}
                              rows={2}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#0071e3]"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1.5 text-xs text-neutral-600 hover:text-neutral-900 font-medium"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={replySubmitting || !replyText.trim()}
                                onClick={() => handleReplySubmit(comment.id, comment.is_public)}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50"
                              >
                                {replySubmitting ? 'Respondendo...' : 'Responder'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RESPOSTAS ANINHADAS (REPLIES) */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="pl-12 pt-2 space-y-3 border-l-2 border-neutral-200 ml-4">
                          {comment.replies.map((reply) => {
                            const isReplyAuthor = userId && reply.user_id === userId;
                            const canDeleteReply = isReplyAuthor || isAdmin;
                            const replyHasLiked =
                              userId && (reply.liked_by || []).includes(userId);

                            return (
                              <div
                                key={reply.id}
                                className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2.5">
                                    {reply.user_avatar ? (
                                      <img
                                        src={reply.user_avatar}
                                        alt={reply.user_name}
                                        className="w-7 h-7 rounded-full object-cover border border-neutral-300"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-[#0071e3]/10 border border-[#0071e3]/20 flex items-center justify-center text-[10px] font-bold text-[#0071e3]">
                                        {reply.user_name?.charAt(0)?.toUpperCase() || 'A'}
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-neutral-900">
                                          {reply.user_name}
                                        </span>
                                        {isReplyAuthor && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0071e3]/10 text-[#0071e3] border border-[#0071e3]/20 font-bold">
                                            Você
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-neutral-500 font-medium">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                  </div>

                                  {canDeleteReply && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-neutral-400 hover:text-red-600 p-1 rounded transition-colors"
                                      title="Excluir resposta"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs sm:text-sm text-neutral-800 leading-relaxed whitespace-pre-wrap pl-9 font-sans">
                                  {reply.content}
                                </p>

                                <div className="flex items-center gap-3 pl-9 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(reply.id)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                                      replyHasLiked
                                        ? 'text-red-600 bg-red-50 border border-red-200 font-bold'
                                        : 'text-neutral-600 hover:text-[#0071e3] hover:bg-neutral-100 font-medium'
                                    }`}
                                  >
                                    <Heart
                                      className={`w-3 h-3 ${
                                        replyHasLiked ? 'fill-red-600 text-red-600' : ''
                                      }`}
                                    />
                                    <span className="text-xs font-mono">
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
