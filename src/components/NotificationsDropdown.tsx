'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bell,
  AtSign,
  Sparkles,
  MessageSquare,
  Check,
  ExternalLink,
  Loader2,
  X
} from 'lucide-react';
import { WhatsAppIcon } from '@/components/WhatsAppIcon';

interface NotificationLink {
  label: string;
  url: string;
}

interface NotificationItem {
  id: string;
  user_id: string;
  type: 'mention' | 'new_content' | 'reply' | 'system';
  title: string;
  message: string;
  lesson_id?: string;
  module_id?: string;
  comment_id?: string;
  sender_name?: string;
  sender_avatar?: string;
  details?: string | null;
  links?: NotificationLink[] | null;
  is_read: boolean;
  created_at: string;
}

interface NotificationsDropdownProps {
  userId: string | null;
  onNavigateToLesson?: (moduleId?: string, lessonId?: string, commentId?: string) => void;
}

export default function NotificationsDropdown({
  userId,
  onNavigateToLesson
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [linkModal, setLinkModal] = useState<NotificationItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Carregar notificações
  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Erro ao buscar notificações:', err);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
    // Polling a cada 3 min, só com a aba visível (economiza banco e invocações do servidor);
    // ao voltar para a aba, atualiza na hora.
    const tick = () => { if (document.visibilityState === 'visible') loadNotifications(); };
    const interval = setInterval(tick, 180000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [loadNotifications]);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Marcar todas como lidas
  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, markAll: true })
      });
    } catch (_) {}
  };

  // Limpar: remove TODAS as notificações da lista (e do banco)
  const handleClearAll = async () => {
    if (!userId) return;
    setNotifications([]);
    setUnreadCount(0);
    try {
      await fetch(`/api/notifications?userId=${encodeURIComponent(userId)}&all=1`, { method: 'DELETE' });
    } catch (_) {}
  };

  // Remover uma única notificação (botão X)
  const handleDeleteOne = async (e: React.MouseEvent, notif: NotificationItem) => {
    e.stopPropagation();
    if (!userId) return;
    setNotifications(prev => prev.filter(n => n.id !== notif.id));
    if (!notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await fetch(
        `/api/notifications?userId=${encodeURIComponent(userId)}&id=${encodeURIComponent(notif.id)}`,
        { method: 'DELETE' }
      );
    } catch (_) {}
  };

  // Clicar em uma notificação
  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read && userId) {
      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, notificationId: notif.id })
      }).catch(() => {});
    }

    // Notificação com link: abre o modal com a mensagem e os botões.
    if (notif.links?.length) {
      setLinkModal(notif);
      setIsOpen(false);
      return;
    }

    if (notif.lesson_id && onNavigateToLesson) {
      onNavigateToLesson(notif.module_id, notif.lesson_id, notif.comment_id);
      setIsOpen(false);
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / (1000 * 60));
      if (diffMin < 1) return 'agora';
      if (diffMin < 60) return `há ${diffMin} min`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `há ${diffHours}h`;
      const diffDays = Math.floor(diffHours / 24);
      return `há ${diffDays}d`;
    } catch {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BOTÃO DO SININHO DE NOTIFICAÇÃO (Substitui o antigo compass) */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.18] text-neutral-200 hover:text-white border border-white/10 backdrop-blur-md shadow-xs transition-all cursor-pointer group"
        title="Notificações e Novidades"
      >
        <Bell size={16} className="group-hover:scale-110 transition-transform text-white" />

        {/* BADGE PULSANTE DE NOTIFICAÇÕES NÃO LIDAS */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#0071e3] px-1 text-[10px] font-bold text-white shadow-md shadow-blue-500/50 animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#1c1c1e] border border-white/15 shadow-2xl shadow-black/60 z-[60] overflow-hidden animate-fadeIn">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-[#232326]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Notificações
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0071e3] text-white">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] font-semibold text-[#00c7fc] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={12} />
                  <span>Marcar lidas</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] font-semibold text-neutral-300 hover:text-white px-2 py-1 rounded-md bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* LISTA DE NOTIFICAÇÕES */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-neutral-400 text-xs">
                <Bell size={24} className="mx-auto mb-2 opacity-30 text-neutral-500" />
                Nenhuma notificação no momento.
              </div>
            ) : (
              notifications.map((notif) => {
                const isMention = notif.type === 'mention';
                const isNewContent = notif.type === 'new_content';
                const isReply = notif.type === 'reply';

                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-[#2a2a2e] ${
                      !notif.is_read ? 'bg-[#1b2a3d]' : 'bg-[#1c1c1e]'
                    }`}
                  >
                    {/* ÍCONE DA NOTIFICAÇÃO */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border shadow-xs ${
                        isMention
                          ? 'bg-[#0071e3]/20 border-[#0071e3]/40 text-[#00c7fc]'
                          : isNewContent
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : isReply
                          ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                          : 'bg-white/10 border-white/20 text-white'
                      }`}
                    >
                      {isMention ? (
                        <AtSign size={15} />
                      ) : isNewContent ? (
                        <Sparkles size={15} />
                      ) : isReply ? (
                        <MessageSquare size={15} />
                      ) : (
                        <Bell size={15} />
                      )}
                    </div>

                    {/* CONTEÚDO */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-xs font-bold text-white truncate">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 whitespace-nowrap">
                          {formatRelativeTime(notif.created_at)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      {!!notif.links?.length && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#00c7fc] font-semibold mt-1">
                          <span>Ver detalhes</span>
                          <ExternalLink size={10} />
                        </span>
                      )}
                      {!notif.links?.length && notif.lesson_id && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#00c7fc] font-semibold mt-1">
                          <span>{notif.comment_id ? 'Ver comentário' : 'Acessar conteúdo'}</span>
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>

                    {/* PONTO AZUL DE NÃO LIDO + EXCLUIR (X) */}
                    <div className="flex flex-col items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOne(e, notif)}
                        className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                        title="Excluir notificação"
                        aria-label="Excluir notificação"
                      >
                        <X size={13} />
                      </button>
                      {!notif.is_read && (
                        <div className="w-2 h-2 rounded-full bg-[#0071e3] shadow-sm shadow-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* MODAL DA NOTIFICAÇÃO COM LINK */}
      {linkModal && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog" aria-modal="true" aria-label={linkModal.title}
          onClick={() => setLinkModal(null)}
        >
          <div
            className="w-full max-w-md bg-[#16161a] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border bg-white/10 border-white/20 text-white">
                  <Bell size={16} />
                </div>
                <h3 className="text-sm font-bold text-white">{linkModal.title}</h3>
              </div>
              <button type="button" onClick={() => setLinkModal(null)} aria-label="Fechar" className="text-neutral-400 hover:text-white p-1 rounded-md transition-colors cursor-pointer"><X size={18} /></button>
            </div>

            <p className="text-[13px] text-neutral-300 leading-relaxed">{linkModal.details || linkModal.message}</p>

            <div className="flex flex-col gap-2">
              {linkModal.links!.map((link, i) => {
                const isWhatsApp = /^https:\/\/(wa\.me|(www\.)?whatsapp\.com)\//.test(link.url);
                return (
                  <a
                    key={link.url}
                    href={link.url} target="_blank" rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      i === 0
                        ? isWhatsApp ? 'bg-[#25D366] hover:bg-[#20bd5a] text-[#0b1f12]' : 'bg-[#0071e3] hover:bg-[#0077ed] text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                    }`}
                  >
                    {isWhatsApp ? <WhatsAppIcon /> : <ExternalLink size={13} />}
                    {link.label}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
