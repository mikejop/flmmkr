'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  CheckCircle2,
  ListVideo,
  Clock,
  Sparkles,
  Maximize2,
  X,
  Volume2
} from 'lucide-react';
import { VideoProgressTracker, currentUserId } from '@/lib/videoProgress';

export interface PandaVideoItem {
  id: string;
  title: string;
  thumbnail_url: string;
  duration: number;
  duration_formatted: string;
  embed_url: string;
  part_label?: string;
  default_subtitle?: string;
}

interface PandaPlaylistPlayerProps {
  lessonId?: string;
  studentName?: string;
  onLessonEnded?: () => void;
  /** Disparado quando o aluno dá play em qualquer vídeo da lista. */
  onPlay?: () => void;
}

/** Azul da paleta do site (#0071e3), usado no botão de play grande e nos controles do player. */
const PLAYER_COLOR = '0071e3';

type PandaWindow = typeof window & {
  PandaPlayer?: new (id: string, options: { onReady: () => void }) => {
    pipScrollFollow: (options: { panda_id_player: string }) => void;
  };
  pandascripttag?: Array<() => void>;
};

function PandaPlaylistPlayerInner({
  lessonId,
  studentName,
  onLessonEnded,
  onPlay,
  initialVideos,
}: PandaPlaylistPlayerProps & { initialVideos: PandaVideoItem[] }) {
  const [videos] = useState<PandaVideoItem[]>(initialVideos);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // A lista de vídeos começa minimizada (abre pelo botão ou ao passar o mouse na borda).
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [autoPlayNext, setAutoPlayNext] = useState<boolean>(false);
  // Mini player: com menos de 50% do vídeo visível ele flutua no canto; ao voltar a 50%+, retorna ao lugar.
  const slotRef = useRef<HTMLDivElement>(null);
  const [isOffscreen, setIsOffscreen] = useState<boolean>(false);
  const [miniDismissed, setMiniDismissed] = useState<boolean>(false);
  const isMini = isOffscreen && !miniDismissed;
  // Atalho da lista de vídeos (mini-barra): some ao dar play e reaparece conforme o mouse chega perto.
  const railRef = useRef<HTMLElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [railProximity, setRailProximity] = useState<number>(0); // 0 = longe · 1 = em cima
  const RAIL_REACH_PX = 64; // distância curta de aproximação
  const railOpacity = isPlaying ? railProximity : 1;

  const handleRailZoneMove = (e: React.MouseEvent) => {
    const r = railRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = Math.max(r.left - e.clientX, 0, e.clientX - r.right);
    const dy = Math.max(r.top - e.clientY, 0, e.clientY - r.bottom);
    const next = Math.round(Math.max(0, 1 - Math.hypot(dx, dy) / RAIL_REACH_PX) * 10) / 10;
    setRailProximity((prev) => (prev === next ? prev : next));
  };
  const [completedVideos, setCompletedVideos] = useState<string[]>([]);
  // Progresso do aluno: guardado primeiro no aparelho e resumido para o banco (ver lib/videoProgress).
  const [tracker, setTracker] = useState<VideoProgressTracker | null>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);
  // Chave do iframe que já terminou de carregar (preloader aparece enquanto for diferente da chave atual)
  const [loadedKey, setLoadedKey] = useState<string>('');
  const initialCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeSidebarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasAutoCollapsedRef = useRef(false);
  const isSidebarHoveredRef = useRef(false);
  const videosCountRef = useRef(videos.length);

  const activeVideo = videos[currentIndex] || videos[0];
  // Só aula com 2+ vídeos tem lista; com 1 vídeo aparece apenas o player.
  const hasPlaylist = videos.length > 1;

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

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visibleEnough = entry.intersectionRatio >= 0.5;
        setIsOffscreen(!visibleEnough);
        if (visibleEnough) setMiniDismissed(false);
      },
      { threshold: [0.5] }
    );
    io.observe(slot);
    return () => io.disconnect();
  }, []);


  // 1.1 Cria o rastreador de progresso e busca onde o aluno parou (espera no máx. 1,5 s pela nuvem)
  useEffect(() => {
    let alive = true;
    let created: VideoProgressTracker | null = null;
    (async () => {
      const uid = await currentUserId();
      if (!alive) return;
      created = new VideoProgressTracker(uid);
      await Promise.race([
        created.loadRemote(initialVideos.map((v) => v.id)),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
      if (alive) setTracker(created);
      else created.dispose();
    })();
    return () => {
      alive = false;
      created?.dispose();
      setTracker(null);
    };
  }, [lessonId, initialVideos]);

  // 2. Carrega o script oficial do PandaPlayer
  useEffect(() => {
    if (!document.querySelector('script[src="https://player.pandavideo.com.br/api.v2.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://player.pandavideo.com.br/api.v2.js';
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // 2.1 Liga a API do PandaPlayer ao iframe atual (PiP que acompanha a rolagem, como no embed oficial)
  useEffect(() => {
    const w = window as PandaWindow;
    const playerId = `panda-${activeVideo.id}`;
    const init = () => {
      // O iframe só existe depois que o rastreador de progresso fica pronto.
      if (!w.PandaPlayer || !document.getElementById(playerId)) return;
      const player = new w.PandaPlayer(playerId, {
        onReady: () => {},
      });
    };
    if (w.PandaPlayer) {
      init();
    } else {
      w.pandascripttag = w.pandascripttag || [];
      w.pandascripttag.push(init);
    }
  }, [activeVideo.id, iframeKey, tracker]);

  // 3. Listener de Autoplay Sequencial: ao terminar um vídeo, passa automaticamente para o outro
  useEffect(() => {
    const handlePandaMessage = (event: MessageEvent) => {
      // Captura mensagens enviadas pelo iframe do PandaVideo
      try {
        let msgData = event.data;
        if (typeof msgData === 'string' && msgData.startsWith('{')) {
          msgData = JSON.parse(msgData);
        }

        if (tracker && msgData?.message && typeof msgData.message === 'string') {
          const frame = document.getElementById(`panda-${activeVideo.id}`) as HTMLIFrameElement | null;
          if (frame?.contentWindow === event.source) tracker.handle(activeVideo.id, lessonId || 'mod1-1', msgData, activeVideo.duration || undefined);
        }

        const isEnded =
          msgData?.message === 'panda_ended' ||
          msgData?.type === 'panda_ended' ||
          msgData?.event === 'ended';

        const isPlay = msgData?.message === 'panda_play' || msgData?.type === 'panda_play' || msgData?.event === 'play';
        if (isPlay) { setIsPlaying(true); onPlay?.(); }
        if (msgData?.message === 'panda_pause' || msgData?.type === 'panda_pause') setIsPlaying(false);

        if (isEnded) {
          setIsPlaying(false);
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
  }, [currentIndex, videos.length, activeVideo.id, activeVideo.duration, lessonId, tracker, onLessonEnded, onPlay]);

  const handleSelectVideo = (index: number) => {
    if (index === currentIndex) return;
    tracker?.flush(true);
    setCurrentIndex(index);
    setIsPlaying(false);
    setAutoPlayNext(true);
    setIframeKey((prev) => prev + 1);
  };

  const currentKey = `${activeVideo.id}-${iframeKey}`;
  const isPlayerLoading = !tracker || loadedKey !== currentKey;

  // Rede de segurança: se o evento de carregamento não chegar, libera o player após 15 s
  useEffect(() => {
    const timer = setTimeout(() => setLoadedKey(currentKey), 15000);
    return () => clearTimeout(timer);
  }, [currentKey]);

  // Retoma de onde o aluno parou (calculado uma vez por vídeo aberto)
  const startAt = useMemo(
    () => tracker?.getResume(activeVideo.id, activeVideo.duration || undefined) ?? 0,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tracker, currentKey],
  );

  // URL do iframe com parâmetro autoplay dinâmico e sem logo
  const embedSrc = `${activeVideo.embed_url}${
    activeVideo.default_subtitle ? `&defaultSubtitle=${encodeURIComponent(activeVideo.default_subtitle)}` : ''
  }${
    autoPlayNext ? '&autoplay=true' : ''
  }${
    startAt > 0 ? `&startTime=${startAt}` : ''
  }&color=${PLAYER_COLOR}&saveProgress=false&alternativeProgress=false&disableForward=false&initQuality=2160p&controls=play-large,play,progress,current-time,mute,volume,captions,settings,pip,airplay,cast,fullscreen`;

  return (
    <div className="w-full bg-[#121318] border border-white/10 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden selection:bg-[#0071e3] selection:text-white transition-all">
      <div className="flex flex-col w-full">

        {/* ÁREA DO PLAYER DO PANDAVIDEO (LADO DIREITO) */}
        <main className="flex-1 min-w-0 bg-black flex flex-col justify-center relative">
          {hasPlaylist && !isSidebarOpen && (
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
          <div ref={slotRef} className="relative w-full aspect-[1.54] mx-auto bg-black">
          <div
            className={
              isMini
                ? 'fixed bottom-36 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] aspect-[1.54] overflow-hidden rounded-xl border border-white/15 bg-black shadow-2xl animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none'
                : 'absolute inset-0 overflow-hidden bg-black flex items-center justify-center'
            }
          >
            {isMini && (
              <div className="absolute right-2 top-2 z-40 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => slotRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })}
                  aria-label="Voltar ao vídeo"
                  title="Voltar ao vídeo"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
                >
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => setMiniDismissed(true)}
                  aria-label="Fechar mini player"
                  title="Fechar mini player"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-black/90"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            )}
            {tracker && <iframe
              key={`panda-iframe-${activeVideo.id}-${iframeKey}`}
              id={`panda-${activeVideo.id}`}
              src={embedSrc}
              title={activeVideo.title}
              className="w-full h-full border-0 absolute inset-0"
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen={true}
              onLoad={() => setLoadedKey(currentKey)}
              {...({ fetchPriority: 'high' } as Record<string, string>)}
            />}

            {/* Preloader: cobre o player até o vídeo carregar e então some */}
            <div
              role="status"
              aria-live="polite"
              aria-hidden={!isPlayerLoading}
              className={`absolute inset-0 z-[25] flex flex-col items-center justify-center gap-4 bg-[#0c0d11] transition-opacity duration-300 ${
                isPlayerLoading ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              <span
                aria-hidden="true"
                className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[#0071e3] motion-reduce:animate-none"
              />
              <span className="font-sans text-sm font-medium text-white/70">
                {isPlayerLoading ? 'Carregando vídeo…' : ''}
              </span>
            </div>

            {/* Máscara estética protetora contra logotipo do PandaVideo */}
            <div
              className="pointer-events-none absolute bottom-0 right-0 w-24 h-12 z-20"
              style={{
                background: 'linear-gradient(to top left, rgba(0,0,0,0.4) 0%, transparent 60%)'
              }}
            />

            {hasPlaylist && (
            <>
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
            {/* Zona de aproximação: a mini-barra + 64px ao redor. Só captura o mouse com o vídeo tocando
                (o iframe do Panda não repassa o movimento do mouse ao resto da página). */}
            <div
              onMouseMove={handleRailZoneMove}
              onMouseLeave={() => setRailProximity(0)}
              className="absolute left-0 top-0 z-30 hidden lg:block pl-3 pt-3 pr-16 pb-16"
              style={{ pointerEvents: isPlaying && !isSidebarOpen ? 'auto' : 'none' }}
            >
            <aside
              ref={railRef}
              aria-label="Lista de vídeos recolhida"
              aria-hidden={isSidebarOpen}
              inert={isSidebarOpen}
              onMouseEnter={() => { setRailProximity(1); handleSidebarMouseEnter(); }}
              onMouseLeave={handleSidebarMouseLeave}
              className="relative flex flex-col items-center py-2 px-1.5 rounded-2xl border border-white/10 bg-black/70"
              style={{
                opacity: isSidebarOpen ? 0 : railOpacity,
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
            </>
            )}
          </div>
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

/**
 * Busca os vídeos da aula no servidor: o ID do vídeo e a marca d'água só chegam ao navegador de quem tem acesso ativo
 * (checado em /api/content/panda-info). Nada de vídeo é conhecido antes disso.
 */
export default function PandaPlaylistPlayer(props: PandaPlaylistPlayerProps) {
  const lessonId = props.lessonId || 'mod1-1';
  const [state, setState] = useState<{ status: 'loading' | 'error' | 'ready'; videos: PandaVideoItem[]; denied?: boolean }>({ status: 'loading', videos: [] });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`/api/content/panda-info?lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store', credentials: 'same-origin' });
        const data = await res.json().catch(() => null);
        if (!alive) return;
        if (res.ok && data?.success && Array.isArray(data.videos) && data.videos.length > 0) {
          setState({ status: 'ready', videos: data.videos as PandaVideoItem[] });
        } else {
          setState({ status: 'error', videos: [], denied: res.status === 401 || res.status === 403 });
        }
      } catch {
        if (alive) setState({ status: 'error', videos: [] });
      }
    })();
    return () => { alive = false; };
  }, [lessonId, attempt]);

  if (state.status === 'ready') return <PandaPlaylistPlayerInner {...props} lessonId={lessonId} initialVideos={state.videos} />;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-[#121318] shadow-2xl sm:rounded-3xl">
      <div className="flex aspect-[1.54] w-full flex-col items-center justify-center gap-4 bg-black px-6 text-center">
        {state.status === 'loading' ? (
          <>
            <span aria-hidden="true" className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-[#0071e3] motion-reduce:animate-none" />
            <span role="status" className="font-sans text-sm font-medium text-white/70">Carregando vídeo…</span>
          </>
        ) : (
          <>
            <p role="alert" className="max-w-sm font-sans text-sm text-white/80">
              {state.denied ? 'O vídeo está disponível só para alunos com acesso ativo.' : 'Não foi possível carregar o vídeo agora.'}
            </p>
            {!state.denied && (
              <button
                type="button"
                onClick={() => { setState({ status: 'loading', videos: [] }); setAttempt((n) => n + 1); }}
                className="min-h-11 rounded-full bg-[#0071e3] px-5 font-sans text-sm font-semibold text-white transition-colors hover:bg-[#0077ed]"
              >
                Tentar de novo
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
