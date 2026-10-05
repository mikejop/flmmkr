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
  is_read: boolean;
  created_at: string;
}

interface NotificationsDropdownProps {
  userId: string | null;
  onNavigateToLesson?: (moduleId?: string, lessonId?: string) => void;
}

export default function NotificationsDropdown({
  userId,
  onNavigateToLesson
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
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
    // Polling sutil a cada 45 segundos para checar novas menções e conteúdos
    const interval = setInterval(loadNotifications, 45000);
    return () => clearInterval(interval);
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

    if (notif.lesson_id && onNavigateToLesson) {
      onNavigateToLesson(notif.module_id, notif.lesson_id);
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
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#1c1c1e]/95 backdrop-blur-xl border border-white/15 shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* HEADER */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/10 bg-white/[0.02]">
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

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-semibold text-[#00c7fc] hover:text-white transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check size={12} />
                <span>Marcar todas como lidas</span>
              </button>
            )}
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
                    className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 hover:bg-white/[0.06] ${
                      !notif.is_read ? 'bg-[#0071e3]/10' : ''
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

                      {notif.lesson_id && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#00c7fc] font-semibold mt-1">
                          <span>Acessar conteúdo</span>
                          <ExternalLink size={10} />
                        </span>
                      )}
                    </div>

                    {/* PONTO AZUL DE NÃO LIDO */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-[#0071e3] shrink-0 mt-1.5 shadow-sm shadow-blue-500" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
