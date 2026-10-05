'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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

interface VideoLessonPlayerProps {
  videoUrl?: string;
  title: string;
  poster?: string;
  onLessonEnded?: () => void;
}

export default function VideoLessonPlayer({ videoUrl, title, poster, onLessonEnded }: VideoLessonPlayerProps) {
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

  // Initialize HLS / Native video source
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    setVideoAspectRatio(null);
    setIsBuffering(true);

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

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
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
      // Native Safari HLS or direct MP4/WebM
      video.src = videoUrl;
      video.addEventListener('loadedmetadata', () => {
        setIsBuffering(false);
        setDuration(video.duration || 0);
        if (video.videoWidth && video.videoHeight && video.videoHeight > 0) {
          setVideoAspectRatio(video.videoWidth / video.videoHeight);
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
      // Don't trigger shortcuts if user is typing in an input/textarea
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

  // Format seconds to mm:ss or hh:mm:ss
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Placeholder when no video is configured
  if (!videoUrl) {
    return (
      <div className="w-full aspect-video rounded-[24px] bg-[#141416] border border-white/10 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center text-center p-6 sm:p-10 select-none group">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0071e3]/15 via-transparent to-black/80 pointer-events-none" />
        
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
        onEnded={() => onLessonEnded?.()}
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

      {/* Big Center Play Button Overlay before start or when paused */}
      {(!isPlaying || !hasStarted) && !isBuffering && (
        <div
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] cursor-pointer transition-opacity z-10"
        >
          <div className="w-20 h-20 rounded-full bg-[#0071e3]/90 hover:bg-[#0071e3] text-white flex items-center justify-center shadow-2xl shadow-blue-500/30 transition-transform duration-200 hover:scale-110 active:scale-95 border border-white/30 pl-1">
            <Play size={32} fill="white" />
          </div>
        </div>
      )}

      {/* Top Title Bar (Visible on Hover/Controls active) */}
      <div
        className={`absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none z-20 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#00c7fc] font-mono">
              FLMMKR PLAYER · 4K DCI
            </span>
            <h2 className="text-sm sm:text-base font-bold text-white tracking-tight line-clamp-1 drop-shadow-md">
              {title}
            </h2>
          </div>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-black/90 via-black/60 to-transparent transition-all duration-300 z-20 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        {/* Scrubber Progress Bar */}
        <div className="relative w-full h-5 flex items-center group/scrubber cursor-pointer mb-2">
          {/* Background Track */}
          <div className="w-full h-1.5 group-hover/scrubber:h-2.5 bg-white/20 rounded-full overflow-hidden transition-all duration-150 relative">
            {/* Buffered */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full transition-all"
              style={{ width: `${bufferPercent}%` }}
            />
            {/* Played */}
            <div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#0071e3] to-[#00c7fc] rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/scrubber:scale-100 transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Invisible Range Input for Interaction */}
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

        {/* Buttons Row */}
        <div className="flex items-center justify-between text-white text-xs">
          {/* Left Controls: Play, Skip, Time */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="p-1.5 sm:p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
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

          {/* Right Controls: Speed, PiP, Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
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
