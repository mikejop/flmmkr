'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  ListVideo,
  Clock,
  Sparkles,
  Maximize2,
  Volume2
} from 'lucide-react';

export interface PandaVideoItem {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  duration_formatted: string;
  embed_url: string;
  part_label?: string;
}

interface PandaPlaylistPlayerProps {
  lessonId?: string;
  studentName?: string;
  onLessonEnded?: () => void;
}

const INITIAL_VIDEOS: PandaVideoItem[] = [
  {
    id: 'dcc5a135-2d08-4589-b0f1-caff163a7cf5',
    title: 'Introdução ao DaVinci Resolve',
    thumbnail_url: 'https://cdn.pandavideo.com/vz-5bb7b1c1-d28/dcc5a135-2d08-4589-b0f1-caff163a7cf5/thumbnail.jpg',
    duration: 330,
    duration_formatted: '05:30',
    embed_url: 'https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=dcc5a135-2d08-4589-b0f1-caff163a7cf5',
    part_label: 'Parte 01'
  },
  {
    id: 'd792f957-2169-4efe-9b64-bc27a16bdb39',
    title: 'Introdução ao DaVinci Resolve',
    thumbnail_url: 'https://cdn.pandavideo.com/vz-5bb7b1c1-d28/d792f957-2169-4efe-9b64-bc27a16bdb39/thumbnail.jpg',
    duration: 789,
    duration_formatted: '13:08',
    embed_url: 'https://player-vz-5bb7b1c1-d28.tv.pandavideo.com.br/embed/?v=d792f957-2169-4efe-9b64-bc27a16bdb39',
    part_label: 'Parte 02'
  }
];

export default function PandaPlaylistPlayer({
  lessonId,
  studentName,
  onLessonEnded
}: PandaPlaylistPlayerProps) {
  const [videos, setVideos] = useState<PandaVideoItem[]>(INITIAL_VIDEOS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(false);
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const initialCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeSidebarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoCollapsedRef = useRef(false);
  const isSidebarHoveredRef = useRef(false);
  const videosCountRef = useRef(videos.length);

  const activeVideo = videos[currentIndex] || videos[0];

  useEffect(() => {
    videosCountRef.current = videos.length;
  }, [videos.length]);

  const clearCloseSidebarTimer = () => {
    if (closeSidebarTimerRef.current) {
      clearTimeout(closeSidebarTimerRef.current);
      closeSidebarTimerRef.current = null;
    }
  };

  const scheduleCloseSidebar = () => {
    clearCloseSidebarTimer();
    if (videosCountRef.current <= 1 || isSidebarHoveredRef.current) return;

    closeSidebarTimerRef.current = setTimeout(() => {
      closeSidebarTimerRef.current = null;
      if (videosCountRef.current > 1 && !isSidebarHoveredRef.current) {
        setIsSidebarOpen(false);
      }
    }, 5000);
  };

  const handleSidebarOpen = () => {
    setIsSidebarOpen(true);
    scheduleCloseSidebar();
  };

  const handleSidebarClose = () => {
    clearCloseSidebarTimer();
    setIsSidebarOpen(false);
  };

  const handleSidebarMouseEnter = () => {
    isSidebarHoveredRef.current = true;
    clearCloseSidebarTimer();
  };

  const handleSidebarMouseLeave = () => {
    isSidebarHoveredRef.current = false;
    if (isSidebarOpen) scheduleCloseSidebar();
  };

  useEffect(() => {
    if (videos.length <= 1 || hasAutoCollapsedRef.current) return;

    initialCollapseTimerRef.current = setTimeout(() => {
      initialCollapseTimerRef.current = null;
      if (videosCountRef.current > 1) {
        hasAutoCollapsedRef.current = true;
        setIsSidebarOpen(false);
      }
    }, 3000);

    return () => {
      if (initialCollapseTimerRef.current) {
        clearTimeout(initialCollapseTimerRef.current);
        initialCollapseTimerRef.current = null;
      }
    };
  }, [videos.length]);

  useEffect(() => () => {
    if (initialCollapseTimerRef.current) clearTimeout(initialCollapseTimerRef.current);
    if (closeSidebarTimerRef.current) clearTimeout(closeSidebarTimerRef.current);
  }, []);

  // 1. Busca dinâmica dos dados oficiais no PandaVideo via API
  useEffect(() => {
    let isMounted = true;
    fetch('/api/content/panda-info')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setVideos(data.videos);
        }
      })
      .catch((err) => {
        console.warn('Erro ao sincronizar informações do PandaVideo:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Carrega o script oficial do PandaPlayer
  useEffect(() => {
    if (!document.querySelector('script[src="https://player.pandavideo.com.br/api.v2.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://player.pandavideo.com.br/api.v2.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // 3. Listener de Autoplay Sequencial: ao terminar um vídeo, passa automaticamente para o outro
  useEffect(() => {
    const handlePandaMessage = (event: MessageEvent) => {
      // Captura mensagens enviadas pelo iframe do PandaVideo
      try {
        let msgData = event.data;
        if (typeof msgData === 'string' && msgData.startsWith('{')) {
          msgData = JSON.parse(msgData);
        }

        const isEnded =
          msgData?.message === 'panda_ended' ||
          msgData?.type === 'panda_ended' ||
          msgData?.event === 'ended';

        if (isEnded) {
          // Marca o vídeo atual como concluído
          setCompletedVideos((prev) =>
            prev.includes(activeVideo.id) ? prev : [...prev, activeVideo.id]
          );

          // Se houver próximo vídeo na lista, avança e inicia automaticamente
          if (currentIndex < videos.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setAutoPlayNext(true);
            setIframeKey((prev) => prev + 1);
          } else {
            // Último vídeo da aula concluído
            if (onLessonEnded) {
              onLessonEnded();
            }
          }
        }
      } catch (err) {
        // Ignora mensagens de outras extensões
      }
    };

    window.addEventListener('message', handlePandaMessage);
    return () => {
      window.removeEventListener('message', handlePandaMessage);
    };
  }, [currentIndex, videos.length, activeVideo.id, onLessonEnded]);

  const handleSelectVideo = (index: number) => {
    if (index === currentIndex) return;
    setCurrentIndex(index);
    setAutoPlayNext(true);
    setIframeKey((prev) => prev + 1);
  };

  // URL do iframe com parâmetro autoplay dinâmico e sem logo
  const embedSrc = `${activeVideo.embed_url}${
    autoPlayNext ? '&autoplay=true' : ''
  }&initQuality=2160p&controls=play-large,play,progress,current-time,mute,volume,captions,settings,fullscreen`;

  return (
    <div className="w-full bg-[#121318] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden selection:bg-[#0071e3] selection:text-white transition-all">
      <div className="flex flex-col w-full">

        {/* ÁREA DO PLAYER DO PANDAVIDEO (LADO DIREITO) */}
        <main className="flex-1 min-w-0 bg-black flex flex-col justify-center relative">
          {!isSidebarOpen && (
            <button
              onClick={handleSidebarOpen}
              title="Mostrar lista de vídeos"
              className="lg:hidden absolute top-3 left-3 z-30 flex items-center gap-2 rounded-lg border border-white/15 bg-black/75 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-sm"
            >
              <ListVideo className="h-4 w-4 text-[#0071e3]" />
              Lista ({videos.length})
            </button>
          )}
          {/* Container do Iframe com Proporção Responsiva Cinematográfica */}
          <div className="relative w-full aspect-[1.54] mx-auto bg-black overflow-hidden flex items-center justify-center">
            <iframe
              key={`panda-iframe-${activeVideo.id}-${iframeKey}`}
              id={`panda-${activeVideo.id}`}
              src={embedSrc}
              title={activeVideo.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={true}
              {...({ fetchPriority: 'high' } as Record<string, string>)}
            />

            {/* Máscara estética protetora contra logotipo do PandaVideo */}
            <div
              className="pointer-events-none absolute bottom-0 right-0 w-24 h-12 z-20"
              style={{
                background: 'linear-gradient(to top left, rgba(0,0,0,0.4) 0%, transparent 60%)'
              }}
            />

            {/* LISTA DE VÍDEOS: fica POR CIMA do vídeo (não empurra nem muda a proporção do player) */}
            <aside
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              className="absolute inset-y-0 left-0 z-30 flex flex-col w-80 max-w-[88%] overflow-y-auto border-r border-white/10 bg-[#0c0d11]"
              style={{
                transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
                boxShadow: isSidebarOpen ? '0 25px 50px -12px rgba(0,0,0,0.6)' : 'none',
                pointerEvents: isSidebarOpen ? 'auto' : 'none',
                transition: 'transform 320ms cubic-bezier(0.455, 0.03, 0.515, 0.955), box-shadow 320ms cubic-bezier(0.455, 0.03, 0.515, 0.955)',
                willChange: 'transform',
              }}
              aria-hidden={!isSidebarOpen}
              inert={!isSidebarOpen}
            >
                <div className="p-3 sm:p-4 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-white/5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-white/50 flex items-center gap-2">
                      <ListVideo className="w-3.5 h-3.5 text-[#0071e3]" />
                      Aulas do Módulo ({videos.length})
                    </span>
                    <button
                      onClick={handleSidebarClose}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer p-1 rounded"
                      title="Minimizar lista"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Lista Vertical dos Vídeos */}
                  <div className="space-y-2">
                    {videos.map((vid, idx) => {
                      const isCurrent = idx === currentIndex;
                      const isCompleted = completedVideos.includes(vid.id);

                      return (
                        <button
                          key={vid.id}
                          onClick={() => handleSelectVideo(idx)}
                          className={`w-full text-left p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer flex items-center gap-3 border group ${
                            isCurrent
                              ? 'bg-[#0071e3]/10 border-[#0071e3] shadow-[0_0_20px_rgba(0,113,227,0.25)] ring-1 ring-[#0071e3]/50'
                              : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                          }`}
                        >
                          {/* Miniatura do PandaVideo */}
                          <div className="relative w-20 sm:w-24 aspect-video rounded-lg overflow-hidden bg-black shrink-0 border border-white/10">
                            {vid.thumbnail_url ? (
                              <img
                                src={vid.thumbnail_url}
                                alt={vid.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                                <Play className="w-4 h-4 text-white/40" />
                              </div>
                            )}

                            {/* Tag de duração na thumbnail */}
                            <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                              {vid.duration_formatted}
                            </div>

                            {/* Overlay se estiver tocando */}
                            {isCurrent && (
                              <div className="absolute inset-0 bg-[#0071e3]/30 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-[#0071e3] text-white flex items-center justify-center shadow-lg">
                                  <Play className="w-3 h-3 fill-current ml-0.5" />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Informações textuais do vídeo */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span
                                className={`text-[10px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded ${
                                  isCurrent
                                    ? 'bg-[#0071e3] text-white'
                                    : 'bg-white/10 text-white/60'
                                }`}
                              >
                                {vid.part_label || `Parte ${idx + 1}`}
                              </span>
                              {isCompleted && (
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                              )}
                            </div>

                            <h4
                              className={`text-xs font-medium leading-snug line-clamp-2 transition-colors ${
                                isCurrent ? 'text-white font-semibold' : 'text-white/70 group-hover:text-white'
                              }`}
                            >
                              {vid.title}
                            </h4>

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-white/40">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {vid.duration_formatted}
                              </span>
                              {isCurrent && (
                                <span className="text-[#0071e3] font-semibold text-[10px] animate-pulse">
                                  • Tocando
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
            </aside>

            {/* Mini-barra (lista recolhida): entra/sai com a mesma curva quadrática */}
            <aside
              aria-label="Lista de vídeos recolhida"
              aria-hidden={isSidebarOpen}
              inert={isSidebarOpen}
              onMouseEnter={handleSidebarMouseEnter}
              onMouseLeave={handleSidebarMouseLeave}
              className="absolute top-3 left-3 z-30 hidden lg:flex flex-col items-center py-2 px-1.5 rounded-2xl border border-white/10 bg-black/70"
              style={{
                opacity: isSidebarOpen ? 0 : 1,
                transform: isSidebarOpen ? 'translateX(-12px)' : 'translateX(0)',
                pointerEvents: isSidebarOpen ? 'none' : 'auto',
                transition: 'opacity 320ms cubic-bezier(0.455, 0.03, 0.515, 0.955), transform 320ms cubic-bezier(0.455, 0.03, 0.515, 0.955)',
              }}
            >
                <div className="flex flex-col items-center gap-4 py-2">
                  <button
                    onClick={handleSidebarOpen}
                    title="Maximizar lista de vídeos"
                    className="w-7 h-7 rounded-full bg-white/[0.04] hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#0071e3]/80 hover:text-white transition-all duration-200 ease-out hover:scale-125 hover:shadow-[0_0_14px_rgba(0,113,227,0.3)] focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="flex flex-col items-center gap-3">
                    {videos.map((vid, idx) => {
                      const isCurrent = idx === currentIndex;
                      return (
                        <button
                          key={vid.id}
                          onClick={() => handleSelectVideo(idx)}
                          title={`${vid.title} (${vid.duration_formatted})`}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all duration-200 ease-out hover:scale-125 focus-visible:scale-125 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] cursor-pointer ${
                            isCurrent
                              ? 'bg-[#0071e3]/80 text-white hover:bg-[#0071e3] hover:shadow-[0_0_14px_rgba(0,113,227,0.45)]'
                              : 'bg-white/[0.04] text-white/40 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
            </aside>
          </div>

          {/* Barra inferior de status e navegação entre partes */}
          <div className="px-4 py-3 bg-[#0d0e12] border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs text-white/70">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0071e3] animate-ping" />
              <span className="font-medium text-white">{activeVideo.title}</span>
            </div>

            <div className="flex items-center gap-3">
              {currentIndex > 0 && (
                <button
                  onClick={() => handleSelectVideo(currentIndex - 1)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Vídeo Anterior</span>
                </button>
              )}

              {currentIndex < videos.length - 1 ? (
                <button
                  onClick={() => handleSelectVideo(currentIndex + 1)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#0071e3] hover:bg-[#0077ed] text-white font-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <span>Próximo Vídeo</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Playlist Completa</span>
                </span>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
