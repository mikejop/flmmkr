'use client';

import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  FastForward,
  Settings,
  Sparkles,
  Loader2,
  PictureInPicture2
} from 'lucide-react';

export interface VideoLessonPlayerHandle {
  play: () => void;
  pause: () => void;
  isPlaying: () => boolean;
}

interface VideoQualityLevel {
  id: number;
  label: string;
  height: number;
  bitrate?: number;
}

interface VideoLessonPlayerProps {
  videoUrl?: string;
  title: string;
  poster?: string;
  studentName?: string;
  onLessonEnded?: () => void;
}

export const VideoLessonPlayer = forwardRef<VideoLessonPlayerHandle, VideoLessonPlayerProps>(
  function VideoLessonPlayer(
    {
      videoUrl,
      title,
      poster,
      studentName = 'Aluno',
      onLessonEnded,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [isBuffering, setIsBuffering] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [hasStarted, setHasStarted] = useState(false);
    const [videoAspectRatio, setVideoAspectRatio] = useState<number | null>(null);

    // Sistema de Resolução de Vídeo
    const [qualityLevels, setQualityLevels] = useState<VideoQualityLevel[]>([]);
    const [selectedQuality, setSelectedQuality] = useState<number>(-1); // -1 = Auto
    const [currentQualityLabel, setCurrentQualityLabel] = useState<string>('Auto');
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // Expor controle imperativo (play / pause / status)
    useImperativeHandle(ref, () => ({
      play: () => {
        const video = videoRef.current;
        if (video) {
          video.play().catch(console.error);
        }
      },
      pause: () => {
        const video = videoRef.current;
        if (video) {
          video.pause();
        }
      },
      isPlaying: () => {
        const video = videoRef.current;
        return !!(video && !video.paused && !video.ended);
      }
    }), []);

    // Initialize HLS / Native video source
    useEffect(() => {
      const video = videoRef.current;
      if (!video || !videoUrl) return;

      setVideoAspectRatio(null);
      setIsBuffering(true);
      setQualityLevels([]);
      setSelectedQuality(-1);
      setCurrentQualityLabel('Auto');

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (Hls.isSupported() && videoUrl.includes('.m3u8')) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });

        hls.loadSource(videoUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
          setIsBuffering(false);

          // Extrair apenas as resoluções reais que o vídeo possui
          if (data && data.levels && data.levels.length > 0) {
            // Mapeia e remove eventuais alturas duplicadas mantendo os melhores níveis
            const uniqueLevels: VideoQualityLevel[] = [];
            const seenHeights = new Set<number>();

            // Iterar preservando o índice real no hls.levels
            data.levels.forEach((lvl, idx) => {
              const h = lvl.height;
              if (h && !seenHeights.has(h)) {
                seenHeights.add(h);
                uniqueLevels.push({
                  id: idx,
                  label: `${h}p`,
                  height: h,
                  bitrate: lvl.bitrate
                });
              }
            });

            // Ordena do maior para o menor (ex: 1080p -> 720p -> 480p)
            uniqueLevels.sort((a, b) => b.height - a.height);
            setQualityLevels(uniqueLevels);
          }
        });

        hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
          if (hls.levels && hls.levels[data.level]) {
            const lvl = hls.levels[data.level];
            if (hls.autoLevelEnabled) {
              setCurrentQualityLabel(`Auto (${lvl.height}p)`);
            } else {
              setCurrentQualityLabel(`${lvl.height}p`);
            }
          }
        });

        hls.on(Hls.Events.BUFFER_APPENDING, () => {
          if (video.buffered.length > 0) {
            const end = video.buffered.end(video.buffered.length - 1);
            setBuffered(end);
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        });

        hlsRef.current = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl') || !videoUrl.includes('.m3u8')) {
        video.src = videoUrl;
        video.addEventListener('loadedmetadata', () => {
          setIsBuffering(false);
          setDuration(video.duration || 0);
          if (video.videoWidth && video.videoHeight && video.videoHeight > 0) {
            setVideoAspectRatio(video.videoWidth / video.videoHeight);
            // Para MP4 nativo direto ou Safari HLS nativo sem hls.js, registra a resolução detectada
            setQualityLevels([{
              id: 0,
              label: `${video.videoHeight}p`,
              height: video.videoHeight
            }]);
            setCurrentQualityLabel(`${video.videoHeight}p`);
          }
        });
      }

      return () => {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }
      };
    }, [videoUrl]);

    // Troca de resolução de vídeo
    const handleQualitySelect = (qualityId: number) => {
      setSelectedQuality(qualityId);
      setShowQualityMenu(false);

      if (hlsRef.current) {
        if (qualityId === -1) {
          hlsRef.current.currentLevel = -1; // Auto ABR
          setCurrentQualityLabel('Auto');
        } else {
          hlsRef.current.currentLevel = qualityId;
          const chosen = qualityLevels.find(q => q.id === qualityId);
          if (chosen) {
            setCurrentQualityLabel(chosen.label);
          }
        }
      }
    };

    // Video Event Handlers
    const handleTimeUpdate = () => {
      const video = videoRef.current;
      if (!video) return;
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };

    const handleLoadedMetadata = () => {
      const video = videoRef.current;
      if (!video) return;
      setDuration(video.duration || 0);
      setIsBuffering(false);
      if (video.videoWidth && video.videoHeight && video.videoHeight > 0) {
        setVideoAspectRatio(video.videoWidth / video.videoHeight);
      }
    };

    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setHasStarted(true);
    };
    const handlePause = () => setIsPlaying(false);

    // Final da Aula: Dispara callback para o fluxo da plataforma
    const handleEnded = () => {
      onLessonEnded?.();
    };

    // Toggle Play / Pause
    const togglePlay = useCallback(() => {
      const video = videoRef.current;
      if (!video) return;

      if (video.paused) {
        video.play().catch(console.error);
      } else {
        video.pause();
      }
    }, []);

    // Seek
    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;
      const targetTime = parseFloat(e.target.value);
      video.currentTime = targetTime;
      setCurrentTime(targetTime);
    };

    // Skip ±10s
    const skipTime = (amount: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, Math.min(duration, video.currentTime + amount));
    };

    // Volume
    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const video = videoRef.current;
      if (!video) return;
      const newVol = parseFloat(e.target.value);
      video.volume = newVol;
      setVolume(newVol);
      setIsMuted(newVol === 0);
    };

    const toggleMute = () => {
      const video = videoRef.current;
      if (!video) return;
      if (isMuted) {
        video.muted = false;
        video.volume = volume || 0.5;
        setIsMuted(false);
      } else {
        video.muted = true;
        setIsMuted(true);
      }
    };

    // Speed
    const handleSpeedSelect = (speed: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    };

    // Fullscreen
    const toggleFullscreen = () => {
      const container = containerRef.current;
      if (!container) return;

      if (!document.fullscreenElement) {
        container.requestFullscreen?.().catch(console.error);
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.().catch(console.error);
        setIsFullscreen(false);
      }
    };

    // Picture in Picture
    const togglePiP = async () => {
      const video = videoRef.current;
      if (!video) return;
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await video.requestPictureInPicture();
        }
      } catch (e) {
        console.error(e);
      }
    };

    // Controls auto-hide
    const handleMouseMove = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      if (isPlaying) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
          setShowSpeedMenu(false);
        }, 2800);
      }
    };

    // Keyboard Shortcuts
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        switch (e.key.toLowerCase()) {
          case ' ':
          case 'k':
            e.preventDefault();
            togglePlay();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
          case 'm':
            e.preventDefault();
            toggleMute();
            break;
          case 'arrowleft':
            e.preventDefault();
            skipTime(-5);
            break;
          case 'arrowright':
            e.preventDefault();
            skipTime(5);
            break;
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay]);

    const formatTime = (secs: number) => {
      if (isNaN(secs)) return '0:00';
      const m = Math.floor(secs / 60);
      const s = Math.floor(secs % 60);
      return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Fallback if no video URL is provided
    if (!videoUrl) {
      return (
        <div className="relative w-full aspect-video rounded-[22px] sm:rounded-[26px] bg-[#141416] border border-white/10 flex flex-col items-center justify-center p-8 text-center overflow-hidden shadow-2xl select-none">
          <div className="absolute inset-0 bg-radial from-[#0071e3]/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10 max-w-md space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-[#0071e3] shadow-lg shadow-blue-500/10 backdrop-blur-md">
              <Sparkles size={28} className="animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#00c7fc]">
                Color Master® · Conteúdo Oficial
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans leading-relaxed">
                Esta aula em vídeo está sendo processada em alta definição. Consulte o manual prático e os fundamentos abaixo.
              </p>
            </div>
          </div>

          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-[11px] text-neutral-500 font-mono border-t border-white/5 pt-3">
            <span>FLMMKR CINEMA PLAYER</span>
            <span>4K DCI · Rec.709</span>
          </div>
        </div>
      );
    }

    const progressPercent = duration ? (currentTime / duration) * 100 : 0;
    const bufferPercent = duration ? (buffered / duration) * 100 : 0;

    return (
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        style={videoAspectRatio ? { aspectRatio: `${videoAspectRatio}` } : undefined}
        className={`group relative w-full ${!videoAspectRatio ? 'aspect-video' : ''} rounded-[22px] sm:rounded-[26px] bg-black overflow-hidden shadow-2xl border border-white/10 select-none transition-all duration-300`}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          poster={poster}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onWaiting={handleWaiting}
          onPlaying={handlePlaying}
          onPause={handlePause}
          onEnded={handleEnded}
          onClick={togglePlay}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-black/30 backdrop-blur-xs z-20">
            <div className="w-14 h-14 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white backdrop-blur-md">
              <Loader2 size={26} className="animate-spin text-[#00c7fc]" />
            </div>
          </div>
        )}

        {/* Big Center Play Button (quando pausado ou inicial) */}
        {!isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer transition-opacity duration-200 z-10"
          >
            <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white/10 hover:bg-[#0071e3]/80 border border-white/20 hover:border-[#0071e3] text-white flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 pl-1">
              <Play size={32} fill="currentColor" />
            </div>
          </div>
        )}

        {/* Control Bar Overlay */}
        <div
          className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-5 pt-12 transition-opacity duration-300 z-20 flex flex-col gap-2 ${
            showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Bar & Seek */}
          <div className="relative group/progress h-2 sm:h-2.5 flex items-center cursor-pointer">
            {/* Background track */}
            <div className="absolute inset-x-0 h-1 sm:h-1.5 bg-white/20 rounded-full overflow-hidden transition-all group-hover/progress:h-2">
              {/* Buffer bar */}
              <div
                className="h-full bg-white/30 transition-all duration-150"
                style={{ width: `${bufferPercent}%` }}
              />
            </div>

            {/* Played progress bar */}
            <div
              className="absolute left-0 h-1 sm:h-1.5 bg-gradient-to-r from-[#0071e3] via-[#00c7fc] to-[#30d158] rounded-full pointer-events-none transition-all group-hover/progress:h-2"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Invisible Range Input for smooth seeking */}
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white pt-1">
            {/* Left Controls: Play, Skip, Volume, Timestamp */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={togglePlay}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-white cursor-pointer"
                title={isPlaying ? 'Pausar (Espaço)' : 'Reproduzir (Espaço)'}
              >
                {isPlaying ? <Pause size={17} /> : <Play size={17} fill="currentColor" />}
              </button>

              <button
                onClick={() => skipTime(-10)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-300 hover:text-white cursor-pointer"
                title="Voltar 10s (←)"
              >
                <RotateCcw size={16} />
              </button>

              <button
                onClick={() => skipTime(10)}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-300 hover:text-white cursor-pointer"
                title="Avançar 10s (→)"
              >
                <FastForward size={16} />
              </button>

              {/* Volume Control */}
              <div className="flex items-center gap-1.5 group/vol pl-1">
                <button
                  onClick={toggleMute}
                  className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-300 hover:text-white cursor-pointer"
                  title={isMuted ? 'Ativar Som (M)' : 'Silenciar (M)'}
                >
                  {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
                </button>

                <div className="w-0 overflow-hidden group-hover/vol:w-16 sm:group-hover/vol:w-20 transition-all duration-200 flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 sm:w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-[#00c7fc]"
                  />
                </div>
              </div>

              {/* Time Stamp */}
              <div className="text-[11px] sm:text-xs font-mono text-neutral-300 pl-1 select-none">
                <span>{formatTime(currentTime)}</span>
                <span className="text-neutral-500 mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls: Resolution, Speed, PiP, Fullscreen */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Seletor de Resolução do Vídeo (exibe apenas as resoluções reais que o vídeo possui) */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowQualityMenu(!showQualityMenu);
                      setShowSpeedMenu(false);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                      showQualityMenu
                        ? 'bg-[#0071e3] text-white border-[#0071e3]'
                        : 'bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border-white/10'
                    }`}
                    title="Qualidade / Resolução do Vídeo"
                  >
                    <Settings size={13} className={showQualityMenu ? 'animate-spin' : ''} />
                    <span>
                      {selectedQuality === -1
                        ? (currentQualityLabel.includes('Auto') ? 'Auto' : currentQualityLabel)
                        : (qualityLevels.find(q => q.id === selectedQuality)?.label || currentQualityLabel)}
                    </span>
                  </button>

                  {showQualityMenu && (
                    <div className="absolute bottom-9 right-0 bg-[#1c1c1e] border border-white/15 rounded-xl shadow-2xl py-1.5 w-32 z-50">
                      <div className="px-2.5 py-1 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/5 mb-1 flex items-center justify-between">
                        <span>Resolução</span>
                        <span className="text-[8px] text-[#00c7fc]">HD</span>
                      </div>

                      {/* Opção Auto se houver mais de uma resolução HLS */}
                      {qualityLevels.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleQualitySelect(-1)}
                          className={`w-full px-3 py-1.5 text-left text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                            selectedQuality === -1
                              ? 'bg-[#0071e3] text-white font-bold'
                              : 'text-neutral-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span>Automático</span>
                            {selectedQuality === -1 && (
                              <span className="text-[9px] text-blue-200 opacity-90">{currentQualityLabel}</span>
                            )}
                          </div>
                          {selectedQuality === -1 && <span className="text-[10px]">●</span>}
                        </button>
                      )}

                      {/* Resoluções reais que o vídeo possui */}
                      {qualityLevels.map((lvl) => (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() => handleQualitySelect(lvl.id)}
                          className={`w-full px-3 py-1.5 text-left text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                            selectedQuality === lvl.id
                              ? 'bg-[#0071e3] text-white font-bold'
                              : 'text-neutral-300 hover:text-white hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span>{lvl.label}</span>
                            {lvl.height >= 1080 && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-white/20 font-bold uppercase">FHD</span>
                            )}
                            {lvl.height >= 720 && lvl.height < 1080 && (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-white/20 font-bold uppercase">HD</span>
                            )}
                          </div>
                          {selectedQuality === lvl.id && <span className="text-[10px]">●</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Speed Selector */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowSpeedMenu(!showSpeedMenu);
                    setShowQualityMenu(false);
                  }}
                  className="px-2 py-1 rounded-md text-[11px] font-mono font-bold bg-white/5 hover:bg-white/15 border border-white/10 transition-colors cursor-pointer"
                  title="Velocidade de Reprodução"
                >
                  {playbackSpeed}x
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-9 right-0 bg-[#1c1c1e] border border-white/15 rounded-xl shadow-2xl py-1.5 w-24 z-50">
                    <div className="px-2.5 py-1 text-[9px] font-bold text-neutral-400 uppercase tracking-wider border-b border-white/5 mb-1">
                      Velocidade
                    </div>
                    {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSpeedSelect(s)}
                        className={`w-full px-3 py-1 text-left text-xs font-mono transition-colors flex items-center justify-between cursor-pointer ${
                          playbackSpeed === s
                            ? 'bg-[#0071e3] text-white font-bold'
                            : 'text-neutral-300 hover:text-white hover:bg-white/10'
                        }`}
                      >
                        <span>{s}x</span>
                        {playbackSpeed === s && <span className="text-[9px]">●</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture in Picture */}
              <button
                onClick={togglePiP}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-300 hover:text-white cursor-pointer hidden sm:block"
                title="Picture in Picture"
              >
                <PictureInPicture2 size={16} />
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors text-neutral-300 hover:text-white cursor-pointer"
                title={isFullscreen ? 'Sair da Tela Cheia (F)' : 'Tela Cheia (F)'}
              >
                {isFullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

export default VideoLessonPlayer;
