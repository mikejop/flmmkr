'use client';

import React, { useEffect, useState } from 'react';

interface MemberPreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const MemberPreloader: React.FC<MemberPreloaderProps> = ({
  onComplete,
  minDurationMs = 2000,
}) => {
  // Stages: 'flmmkr' -> 'morphing' -> 'color-master' -> 'fading' -> 'done'
  const [stage, setStage] = useState<'flmmkr' | 'morphing' | 'color-master' | 'fading' | 'done'>('flmmkr');
  const [progressPercent, setProgressPercent] = useState<number>(15);

  useEffect(() => {
    // Stage 1 -> Progress increments
    const p1 = setTimeout(() => setProgressPercent(45), 350);

    // Stage 2: Trigger morph at 650ms
    const morphTimer = setTimeout(() => {
      setStage('morphing');
      setProgressPercent(75);
    }, 650);

    // Stage 3: Lock in COLOR MASTER | PRODUTO at 1300ms
    const revealTimer = setTimeout(() => {
      setStage('color-master');
      setProgressPercent(100);
    }, 1300);

    // Stage 4: Trigger exit fade
    const completeTimer = setTimeout(() => {
      setStage('fading');
      setTimeout(() => {
        setStage('done');
        if (onComplete) onComplete();
      }, 600);
    }, minDurationMs);

    return () => {
      clearTimeout(p1);
      clearTimeout(morphTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [minDurationMs, onComplete]);

  if (stage === 'done') return null;

  const isMorphingOrBeyond = stage === 'morphing' || stage === 'color-master' || stage === 'fading';

  const flmmkrLetters = ['F', 'L', 'M', 'M', 'K', 'R'];

  return (
    <aside
      role="status"
      aria-label="Carregando área de membros..."
      aria-live="polite"
      className={`fixed inset-0 z-[99999] bg-[#070709] flex flex-col items-center justify-center overflow-hidden transition-all duration-700 select-none will-change-[opacity,transform] ${
        stage === 'fading'
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
      }}
    >
      {/* Cinematic Studio Ambient Glow (Site Blue #0071e3) */}
      <div
        className={`absolute w-96 h-96 rounded-full bg-[#0071e3]/20 blur-[130px] pointer-events-none transition-all duration-1000 ${
          isMorphingOrBeyond ? 'opacity-35 scale-125' : 'opacity-15 scale-90'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }}
      />

      {/* Retícula Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-1"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
        }}
      />

      {/* Studio Header Tag */}
      <div 
        className="relative z-10 mb-8 flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-neutral-400 font-medium transition-all duration-500"
        style={{
          opacity: stage === 'fading' ? 0 : 0.9,
          transform: isMorphingOrBeyond ? 'translateY(0)' : 'translateY(5px)',
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#0071e3] shadow-[0_0_8px_#0071e3] animate-pulse" />
        <span>FLMMKR • ÁREA DE MEMBROS</span>
      </div>

      {/* Center Animated Logo / Title Container */}
      <div className="relative z-10 flex items-center justify-center px-4 min-h-[90px] sm:min-h-[120px]">
        {/* FLMMKR Layer (Slides UP and fades out) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          aria-hidden={isMorphingOrBeyond}
        >
          <div className="flex items-center tracking-[0.2em] font-black text-4xl sm:text-6xl md:text-7xl text-white">
            {flmmkrLetters.map((letter, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden transition-all duration-600 will-change-transform"
                style={{
                  transform: isMorphingOrBeyond ? 'translate3d(0, -130%, 0)' : 'translate3d(0, 0%, 0)',
                  opacity: isMorphingOrBeyond ? 0 : 1,
                  transitionDelay: `${idx * 40}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* COLOR MASTER | PRODUTO Layer (Slides UP from below) */}
        <div
          className="flex flex-wrap items-center justify-center font-black tracking-tight text-3xl sm:text-5xl md:text-6xl text-white gap-x-3 sm:gap-x-4 gap-y-1"
          aria-hidden={!isMorphingOrBeyond}
        >
          {/* COLOR MASTER */}
          <span
            className="inline-block transition-all duration-700 will-change-transform"
            style={{
              transform: isMorphingOrBeyond ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 140%, 0)',
              opacity: isMorphingOrBeyond ? 1 : 0,
              transitionDelay: '100ms',
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            COLOR MASTER
          </span>

          {/* Divider | */}
          <span
            className="inline-block text-white/30 font-light transition-all duration-700 will-change-transform"
            style={{
              transform: isMorphingOrBeyond ? 'translate3d(0, 0%, 0) scale(1)' : 'translate3d(0, 140%, 0) scale(0.6)',
              opacity: isMorphingOrBeyond ? 0.8 : 0,
              transitionDelay: '180ms',
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            |
          </span>

          {/* PRODUTO in site primary blue #0071e3 */}
          <span
            className="inline-block text-[#0071e3] drop-shadow-[0_0_25px_rgba(0,113,227,0.45)] transition-all duration-700 will-change-transform"
            style={{
              transform: isMorphingOrBeyond ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 140%, 0)',
              opacity: isMorphingOrBeyond ? 1 : 0,
              transitionDelay: '260ms',
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          >
            PRODUTO
          </span>
        </div>
      </div>

      {/* Status & macOS Loading Line */}
      <div className="relative z-10 mt-10 flex flex-col items-center gap-2">
        <div className="w-48 sm:w-60 h-[3px] bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${progressPercent}%`,
              transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
            }}
          />
        </div>

        <div className="text-[11px] font-mono tracking-wider text-neutral-400 h-4 flex items-center justify-center">
          {progressPercent < 50 && 'Inicializando workspace...'}
          {progressPercent >= 50 && progressPercent < 100 && 'Carregando módulos & simuladores...'}
          {progressPercent >= 100 && 'Pronto'}
        </div>
      </div>
    </aside>
  );
};
export default MemberPreloader;
