'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  AtSign,
  AlertCircle
} from 'lucide-react';

interface CommentItem {
  id: string;
  lesson_id: string;
  module_id?: string;
  user_id: string;
  user_name: string;
  user_nickname?: string | null;
  user_avatar?: string;
  parent_id?: string | null;
  content: string;
  is_public: boolean;
  likes_count: number;
  liked_by?: string[];
  created_at: string;
  replies?: CommentItem[];
}

interface StudentItem {
  id: string;
  name: string;
  tag: string;
  avatar?: string;
  role?: string;
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
    nickname?: string;
    isAdmin?: boolean;
  };
  isAdmin?: boolean;
  /** Comentário/resposta a ser aberto e destacado (vindo de uma notificação) */
  focusCommentId?: string | null;
  onFocusHandled?: () => void;
}

// Detector de URLs para bloquear compartilhamento de links externos
const URL_REGEX = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9-]+\.(com|org|net|io|edu|gov|tv|site|app|dev|me|br|xyz)[^\s]*)/i;

export default function LessonComments({
  lessonId,
  moduleId,
  userId,
  userProfile,
  isAdmin = false,
  focusCommentId = null,
  onFocusHandled
}: LessonCommentsProps) {
  // Estado para controlar abertura / fechamento da barra de comentários
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPublicList, setShowPublicList] = useState(true);

  // Apenas UMA lista de respostas pode ficar aberta por vez
  const [openRepliesId, setOpenRepliesId] = useState<string | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  // Estados de dados
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Lista de alunos para menções @
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [mentionQuery, setMentionQuery] = useState('');
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionTarget, setMentionTarget] = useState<'comment' | 'reply'>('comment');

  // Novo comentário principal
  const [newCommentText, setNewCommentText] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Resposta inline
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replySubmitting, setReplySubmitting] = useState(false);
  const replyTextareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Carregar lista de alunos cadastrados para menções
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch('/api/students/list');
        if (res.ok) {
          const data = await res.json();
          setStudents(data.students || []);
        }
      } catch (_) {}
    }
    loadStudents();
  }, []);

  useEffect(() => {
    loadComments();
    setNewCommentText('');
    setReplyingToId(null);
    setOpenRepliesId(null);
  }, [loadComments]);

  // Abrir/destacar comentário vindo de uma notificação
  useEffect(() => {
    if (!focusCommentId || comments.length === 0) return;

    let rootId: string | null = null;
    for (const c of comments) {
      if (c.id === focusCommentId) { rootId = c.id; break; }
      if ((c.replies || []).some((r) => r.id === focusCommentId)) { rootId = c.id; break; }
    }
    if (!rootId) return; // ainda não carregou / não existe mais

    setIsExpanded(true);
    setShowPublicList(true);
    if (rootId !== focusCommentId) setOpenRepliesId(rootId); // era uma resposta: abre a thread
    setHighlightId(focusCommentId);

    setTimeout(() => {
      document.getElementById(`comment-${focusCommentId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 150);
    setTimeout(() => setHighlightId(null), 4000);
    onFocusHandled?.();
  }, [focusCommentId, comments, onFocusHandled]);

  // Checagem de link
  const commentHasLink = URL_REGEX.test(newCommentText);
  const replyHasLink = URL_REGEX.test(replyText);

  // Tratamento de input no comentário para detectar '@'
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNewCommentText(val);

    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt !== -1 && !textBefore.slice(lastAt).includes(' ')) {
      const query = textBefore.slice(lastAt + 1).toLowerCase();
      setMentionQuery(query);
      setMentionTarget('comment');
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  // Tratamento de input na resposta para detectar '@'
  const handleReplyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setReplyText(val);

    const cursor = e.target.selectionStart;
    const textBefore = val.slice(0, cursor);
    const lastAt = textBefore.lastIndexOf('@');

    if (lastAt !== -1 && !textBefore.slice(lastAt).includes(' ')) {
      const query = textBefore.slice(lastAt + 1).toLowerCase();
      setMentionQuery(query);
      setMentionTarget('reply');
      setShowMentionMenu(true);
    } else {
      setShowMentionMenu(false);
    }
  };

  // Inserir aluno selecionado na mensagem
  const handleSelectMention = (student: StudentItem) => {
    const tag = student.tag || student.name.replace(/\s+/g, '');
    const tagText = `@${tag} `;

    if (mentionTarget === 'comment') {
      const textarea = commentTextareaRef.current;
      if (!textarea) return;
      const cursor = textarea.selectionStart;
      const textBefore = newCommentText.slice(0, cursor);
      const lastAt = textBefore.lastIndexOf('@');
      const textAfter = newCommentText.slice(cursor);

      const updated = (lastAt !== -1 ? newCommentText.slice(0, lastAt) : newCommentText) + tagText + textAfter;
      setNewCommentText(updated);
      setShowMentionMenu(false);
      setTimeout(() => {
        textarea.focus();
      }, 50);
    } else {
      const textarea = replyTextareaRef.current;
      if (!textarea) return;
      const cursor = textarea.selectionStart;
      const textBefore = replyText.slice(0, cursor);
      const lastAt = textBefore.lastIndexOf('@');
      const textAfter = replyText.slice(cursor);

      const updated = (lastAt !== -1 ? replyText.slice(0, lastAt) : replyText) + tagText + textAfter;
      setReplyText(updated);
      setShowMentionMenu(false);
      setTimeout(() => {
        textarea.focus();
      }, 50);
    }
  };

  // Publicar comentário principal
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting || commentHasLink) return;

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
        setShowMentionMenu(false);
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
    if (!replyText.trim() || replySubmitting || replyHasLink) return;

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
        setShowMentionMenu(false);
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

  // Nickname exibido/usado nas menções (sem espaços)
  const nickOf = (c: CommentItem) =>
    (c.user_nickname || c.user_name || 'aluno').toLowerCase().replace(/\s+/g, '');

  // Iniciar resposta: sempre responde na thread do comentário raiz e já preenche @nickname
  const startReply = (rootId: string, targetNick: string) => {
    setReplyingToId(rootId);
    setReplyText(`@${targetNick} `);
    setOpenRepliesId(rootId);
    setShowMentionMenu(false);
    setTimeout(() => replyTextareaRef.current?.focus(), 80);
  };

  // Abre/fecha respostas; abrir uma fecha automaticamente a outra
  const toggleReplies = (rootId: string) => {
    setOpenRepliesId((prev) => (prev === rootId ? null : rootId));
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

  // Renderizar texto com destaque em azul para @menções
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(@[a-zA-Z0-9_\u00C0-\u017F]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="inline-flex items-center font-bold text-[#00c7fc] bg-[#0071e3]/20 border border-[#0071e3]/40 px-1.5 py-0.5 rounded-md mx-0.5 text-xs sm:text-[13px]"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Filtrar alunos para o popup de menção
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(mentionQuery) || s.tag.toLowerCase().includes(mentionQuery)
  );

  return (
    <div className="w-full my-6 bg-[#16161a] border border-white/10 shadow-2xl rounded-[24px] overflow-hidden select-text transition-all duration-300 text-white">
      {/* 1. BARRA MINIMIZADA (HEADER CLICÁVEL COM TEMA ESCURO E ALTO CONTRASTE) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between px-5 sm:px-8 py-5 cursor-pointer hover:bg-white/5 transition-colors select-none group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#0071e3]/15 border border-[#0071e3]/30 flex items-center justify-center text-[#00c7fc] group-hover:scale-105 group-hover:bg-[#0071e3] group-hover:text-white transition-all shadow-xs">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-white group-hover:text-[#00c7fc] transition-colors">
                Comentários e Dúvidas da Aula
              </h3>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
                {totalCount}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium mt-0.5">
              {isExpanded
                ? 'Clique para recolher o campo de comentários'
                : 'Clique para deixar um comentário, marcar colegas com @ ou tirar dúvidas'}
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
            className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#00c7fc] hover:text-white bg-[#0071e3]/15 hover:bg-[#0071e3] border border-[#0071e3]/35 rounded-xl transition-all shadow-xs"
          >
            <Users className="w-4 h-4" />
            <span>Ver comentários da turma ({totalCount})</span>
          </button>

          <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-300 group-hover:text-white group-hover:bg-white/10 transition-all">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* 2. ÁREA EXPANDIDA */}
      {isExpanded && (
        <div className="px-5 sm:px-8 pb-8 pt-4 border-t border-white/10 space-y-6 animate-fadeIn bg-black/40">
          {/* BOTÃO MOBILE PARA VER COMENTÁRIOS */}
          <div className="sm:hidden flex justify-end">
            <button
              type="button"
              onClick={() => setShowPublicList(!showPublicList)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#00c7fc] bg-[#0071e3]/15 border border-[#0071e3]/30 rounded-lg"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Ver comentários da turma ({totalCount})</span>
            </button>
          </div>

          {/* FORMULÁRIO DE NOVO COMENTÁRIO */}
          <form
            onSubmit={handleCreateComment}
            className="p-5 sm:p-6 rounded-2xl bg-[#1a1a1e] border border-white/10 shadow-xl space-y-4 relative"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00c7fc]" />
                Deixar sua dúvida ou comentário
              </span>

              {/* SELETOR: PÚBLICO OU NÃO PÚBLICO */}
              <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setIsPublic(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-all ${
                    isPublic
                      ? 'bg-[#0071e3] text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white font-medium'
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
                      ? 'bg-white/20 text-white font-bold shadow-xs'
                      : 'text-neutral-400 hover:text-white font-medium'
                  }`}
                  title="Apenas o professor verá seu comentário no dashboard dele"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Apenas Professor</span>
                </button>
              </div>
            </div>

            {/* AVISO DO TIPO DE PRIVACIDADE */}
            <div className="text-xs flex items-center gap-2 text-neutral-300 font-medium">
              {isPublic ? (
                <>
                  <Globe className="w-4 h-4 text-[#00c7fc]" />
                  <span>
                    <strong className="text-white">Público:</strong> visível para todos os
                    colegas da turma e para o professor. Use <span className="text-[#00c7fc] font-bold">@nome</span> para marcar colegas.
                  </span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-[#00c7fc]" />
                  <span>
                    <strong className="text-white">Não público (Privado):</strong> apenas você
                    e o professor podem visualizar esta mensagem.
                  </span>
                </>
              )}
            </div>

            {/* TEXTAREA COM REFERÊNCIA */}
            <div className="relative">
              <textarea
                ref={commentTextareaRef}
                value={newCommentText}
                onChange={handleCommentChange}
                placeholder="Escreva sua dúvida, reflexão ou use @ para marcar outro aluno..."
                rows={3}
                className="w-full px-4 py-3 text-sm bg-[#111114] border border-white/15 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/30 transition-all resize-none shadow-xs font-sans leading-relaxed"
              />

              {/* AUTOCOMPLETE POPUP PARA @MENÇÕES */}
              {showMentionMenu && mentionTarget === 'comment' && filteredStudents.length > 0 && (
                <div className="absolute left-0 bottom-full mb-1 w-64 max-h-48 overflow-y-auto bg-[#1f1f23] border border-white/15 rounded-xl shadow-2xl z-30 divide-y divide-white/10 text-white">
                  <div className="p-2 bg-white/5 text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <AtSign size={12} className="text-[#00c7fc]" />
                    <span>Mencionar Aluno</span>
                  </div>
                  {filteredStudents.slice(0, 6).map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectMention(student)}
                      className="flex items-center gap-2.5 p-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                    >
                      {student.avatar ? (
                        <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#00c7fc] text-[10px] font-bold flex items-center justify-center">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-xs font-bold text-white">{student.name}</div>
                        <div className="text-[10px] text-[#00c7fc]">@{student.tag}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AVISO DE BLOQUEIO DE LINKS */}
            {commentHasLink && (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>
                  <strong className="text-white">Links não permitidos:</strong> Para manter a segurança da turma, não é permitido compartilhar links externos nos comentários.
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMentionTarget('comment');
                    setMentionQuery('');
                    setShowMentionMenu(!showMentionMenu);
                    if (commentTextareaRef.current) {
                      setNewCommentText(prev => prev + '@');
                      commentTextareaRef.current.focus();
                    }
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#00c7fc] bg-[#0071e3]/15 hover:bg-[#0071e3]/25 border border-[#0071e3]/30 rounded-lg transition-colors cursor-pointer"
                >
                  <AtSign size={13} />
                  <span>Marcar colega</span>
                </button>
                <span className="text-[11px] text-neutral-400 font-medium hidden sm:inline">
                  Digite @ para mencionar outro aluno
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting || !newCommentText.trim() || commentHasLink}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-500/25 cursor-pointer hover:scale-105 active:scale-95"
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
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                  Discussão da Aula ({comments.length})
                </span>
                {loading && (
                  <div className="flex items-center gap-1.5 text-xs text-[#00c7fc] font-semibold">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                )}
              </div>

              {comments.length === 0 && !loading && (
                <div className="py-10 text-center text-neutral-400 text-sm font-medium">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-neutral-500" />
                  Nenhum comentário deixado nesta aula ainda. Seja o primeiro a perguntar!
                </div>
              )}

              {/* ITERAÇÃO DOS COMENTÁRIOS */}
              <div className="space-y-4">
                {comments.map((comment) => {
                  const isAuthor = !!userId && comment.user_id === userId;
                  const hasLiked = userId && (comment.liked_by || []).includes(userId);
                  const replies = comment.replies || [];
                  const repliesOpen = openRepliesId === comment.id;
                  const commentNick = nickOf(comment);

                  return (
                    <div
                      key={comment.id}
                      id={`comment-${comment.id}`}
                      className={`p-5 rounded-2xl bg-[#1a1a1e] border shadow-md space-y-3 transition-all duration-500 ${
                        highlightId === comment.id
                          ? 'border-[#00c7fc] ring-2 ring-[#0071e3]/60'
                          : 'border-white/10'
                      }`}
                    >
                      {/* HEADER DO COMENTÁRIO */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {comment.user_avatar ? (
                            <img
                              src={comment.user_avatar}
                              alt={comment.user_name}
                              className="w-9 h-9 rounded-full object-cover border border-white/20 shadow-xs"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 flex items-center justify-center text-xs font-bold text-[#00c7fc]">
                              {comment.user_name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                          )}

                          <div>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                              <span className="text-xs sm:text-sm font-bold text-white">
                                {comment.user_name}
                              </span>
                              <span className="text-xs font-semibold text-[#00c7fc]">@{commentNick}</span>
                              {isAuthor && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0071e3]/20 text-[#00c7fc] border border-[#0071e3]/40 font-bold">
                                  Você
                                </span>
                              )}
                              {!comment.is_public && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15 font-bold flex items-center gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  Privado (Professor)
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-neutral-400 font-medium">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* EXCLUIR: somente o dono do comentário */}
                        {isAuthor && (
                          <button
                            type="button"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-neutral-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Excluir meu comentário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* CONTEÚDO COM FORMATAÇÃO DE MENÇÃO */}
                      <p className="text-sm leading-relaxed text-neutral-200 whitespace-pre-wrap pl-12 font-sans">
                        {renderFormattedContent(comment.content)}
                      </p>

                      {/* AÇÕES (CURTIR, RESPONDER, VER RESPOSTAS) */}
                      <div className="flex flex-wrap items-center gap-3 pl-12 pt-1 text-xs">
                        <button
                          type="button"
                          onClick={() => handleToggleLike(comment.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                            hasLiked
                              ? 'text-red-400 bg-red-500/15 border border-red-500/30 font-bold'
                              : 'text-neutral-400 hover:text-[#00c7fc] hover:bg-white/5 border border-transparent font-medium'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-red-400 text-red-400' : ''}`} />
                          <span className="text-xs font-mono">{comment.likes_count || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (replyingToId === comment.id) {
                              setReplyingToId(null);
                            } else {
                              startReply(comment.id, commentNick);
                            }
                          }}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-neutral-400 hover:text-[#00c7fc] hover:bg-white/5 transition-colors font-medium cursor-pointer"
                        >
                          <CornerDownRight className="w-3.5 h-3.5" />
                          <span>Responder</span>
                        </button>

                        {/* INDICADOR DE RESPOSTAS (minimizadas por padrão) */}
                        {replies.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleReplies(comment.id)}
                            aria-expanded={repliesOpen}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors font-semibold cursor-pointer border ${
                              repliesOpen
                                ? 'text-white bg-[#0071e3]/30 border-[#0071e3]/50'
                                : 'text-[#00c7fc] bg-[#0071e3]/10 border-[#0071e3]/30 hover:bg-[#0071e3]/20'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>
                              {repliesOpen ? 'Ocultar' : 'Ver'} {replies.length}{' '}
                              {replies.length === 1 ? 'resposta' : 'respostas'}
                            </span>
                            {repliesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>

                      {/* FORMULÁRIO DE RESPOSTA INLINE */}
                      {replyingToId === comment.id && (
                        <div className="pl-12 pt-2">
                          <div className="p-4 rounded-xl bg-[#121215] border border-white/10 space-y-2.5 relative">
                            <textarea
                              ref={replyTextareaRef}
                              value={replyText}
                              onChange={handleReplyChange}
                              placeholder={`Responder para @${commentNick} (use @ para marcar)...`}
                              rows={2}
                              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#1a1a1e] border border-white/15 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#0071e3]"
                            />

                            {/* AUTOCOMPLETE POPUP PARA @MENÇÕES NA RESPOSTA */}
                            {showMentionMenu && mentionTarget === 'reply' && filteredStudents.length > 0 && (
                              <div className="absolute left-4 bottom-full mb-1 w-64 max-h-48 overflow-y-auto bg-[#1f1f23] border border-white/15 rounded-xl shadow-2xl z-30 divide-y divide-white/10 text-white">
                                <div className="p-2 bg-white/5 text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                                  <AtSign size={12} className="text-[#00c7fc]" />
                                  <span>Mencionar Aluno</span>
                                </div>
                                {filteredStudents.slice(0, 6).map((student) => (
                                  <div
                                    key={student.id}
                                    onClick={() => handleSelectMention(student)}
                                    className="flex items-center gap-2.5 p-2.5 hover:bg-white/10 cursor-pointer transition-colors"
                                  >
                                    {student.avatar ? (
                                      <img src={student.avatar} alt={student.name} className="w-6 h-6 rounded-full object-cover border border-white/20" />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 text-[#00c7fc] text-[10px] font-bold flex items-center justify-center">
                                        {student.name.charAt(0)}
                                      </div>
                                    )}
                                    <div>
                                      <div className="text-xs font-bold text-white">{student.name}</div>
                                      <div className="text-[10px] text-[#00c7fc]">@{student.tag}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* AVISO DE LINK NA RESPOSTA */}
                            {replyHasLink && (
                              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                                <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                                <span>Links não são permitidos nos comentários.</span>
                              </div>
                            )}

                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setReplyingToId(null)}
                                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white font-medium cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={replySubmitting || !replyText.trim() || replyHasLink}
                                onClick={() => handleReplySubmit(comment.id, comment.is_public)}
                                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white disabled:opacity-50 cursor-pointer"
                              >
                                {replySubmitting ? 'Respondendo...' : 'Responder'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* RESPOSTAS (somente uma lista aberta por vez) */}
                      {repliesOpen && replies.length > 0 && (
                        <div className="pl-12 pt-2 space-y-3 border-l-2 border-white/15 ml-4 animate-fadeIn">
                          {replies.map((reply) => {
                            const isReplyAuthor = !!userId && reply.user_id === userId;
                            const replyHasLiked = userId && (reply.liked_by || []).includes(userId);
                            const replyNick = nickOf(reply);

                            return (
                              <div
                                key={reply.id}
                                id={`comment-${reply.id}`}
                                className={`p-4 rounded-xl bg-[#141417] border space-y-2 transition-all duration-500 ${
                                  highlightId === reply.id
                                    ? 'border-[#00c7fc] ring-2 ring-[#0071e3]/60'
                                    : 'border-white/10'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex items-center gap-2.5">
                                    {reply.user_avatar ? (
                                      <img
                                        src={reply.user_avatar}
                                        alt={reply.user_name}
                                        className="w-7 h-7 rounded-full object-cover border border-white/20"
                                      />
                                    ) : (
                                      <div className="w-7 h-7 rounded-full bg-[#0071e3]/20 border border-[#0071e3]/40 flex items-center justify-center text-[10px] font-bold text-[#00c7fc]">
                                        {reply.user_name?.charAt(0)?.toUpperCase() || 'A'}
                                      </div>
                                    )}
                                    <div>
                                      <div className="flex flex-wrap items-center gap-x-1.5">
                                        <span className="text-xs font-bold text-white">{reply.user_name}</span>
                                        <span className="text-[11px] font-semibold text-[#00c7fc]">@{replyNick}</span>
                                        {isReplyAuthor && (
                                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-[#0071e3]/20 text-[#00c7fc] border border-[#0071e3]/40 font-bold">
                                            Você
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-neutral-400 font-medium">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                  </div>

                                  {/* EXCLUIR: somente o dono da resposta */}
                                  {isReplyAuthor && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteComment(reply.id)}
                                      className="text-neutral-400 hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                                      title="Excluir minha resposta"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>

                                <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed whitespace-pre-wrap pl-9 font-sans">
                                  {renderFormattedContent(reply.content)}
                                </p>

                                <div className="flex items-center gap-3 pl-9 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLike(reply.id)}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded transition-colors cursor-pointer ${
                                      replyHasLiked
                                        ? 'text-red-400 bg-red-500/15 border border-red-500/30 font-bold'
                                        : 'text-neutral-400 hover:text-[#00c7fc] hover:bg-white/5 font-medium'
                                    }`}
                                  >
                                    <Heart className={`w-3 h-3 ${replyHasLiked ? 'fill-red-400 text-red-400' : ''}`} />
                                    <span className="text-xs font-mono">{reply.likes_count || 0}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => startReply(comment.id, replyNick)}
                                    className="flex items-center gap-1 px-2 py-0.5 rounded text-neutral-400 hover:text-[#00c7fc] hover:bg-white/5 transition-colors font-medium cursor-pointer"
                                  >
                                    <CornerDownRight className="w-3 h-3" />
                                    <span>Responder</span>
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
