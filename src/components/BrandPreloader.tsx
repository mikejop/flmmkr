'use client';

import React, { useEffect, useState } from 'react';

interface BrandPreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const BrandPreloader: React.FC<BrandPreloaderProps> = ({
  onComplete,
  minDurationMs = 2400,
}) => {
  // Stages: 'flmmkr' -> 'morphing' -> 'color-master' -> 'fading' -> 'done'
  const [stage, setStage] = useState<'flmmkr' | 'morphing' | 'color-master' | 'fading' | 'done'>('flmmkr');
  const [pageLoaded, setPageLoaded] = useState<boolean>(false);

  useEffect(() => {
    const startTime = Date.now();

    // Check document readiness
    const checkReady = () => {
      if (document.readyState === 'complete') {
        setPageLoaded(true);
      }
    };

    if (document.readyState === 'complete') {
      setPageLoaded(true);
    } else {
      window.addEventListener('load', checkReady);
    }

    // Step 1: Hold FLMMKR for 700ms, then trigger letter morph
    const morphTimer = setTimeout(() => {
      setStage('morphing');
    }, 700);

    // Step 2: Lock in COLOR MASTER® at ~1500ms
    const revealTimer = setTimeout(() => {
      setStage('color-master');
    }, 1500);

    // Step 3: Trigger exit fade once minDuration is met AND page is loaded
    const completeTimer = setTimeout(() => {
      const executeFade = () => {
        setStage('fading');
        setTimeout(() => {
          setStage('done');
          if (onComplete) onComplete();
        }, 650);
      };

      if (document.readyState === 'complete') {
        executeFade();
      } else {
        const onFinalLoad = () => {
          executeFade();
          window.removeEventListener('load', onFinalLoad);
        };
        window.addEventListener('load', onFinalLoad);
      }
    }, Math.max(minDurationMs, Date.now() - startTime + 800));

    return () => {
      window.removeEventListener('load', checkReady);
      clearTimeout(morphTimer);
      clearTimeout(revealTimer);
      clearTimeout(completeTimer);
    };
  }, [minDurationMs, onComplete]);

  if (stage === 'done') return null;

  const isMorphingOrBeyond = stage === 'morphing' || stage === 'color-master' || stage === 'fading';

  const flmmkrLetters = ['F', 'L', 'M', 'M', 'K', 'R'];
  const colorMasterLetters = [
    { char: 'C', delay: 0 },
    { char: 'O', delay: 30 },
    { char: 'L', delay: 60 },
    { char: 'O', delay: 90 },
    { char: 'R', delay: 120 },
    { char: ' ', delay: 140, isSpace: true },
    { char: 'M', delay: 160 },
    { char: 'A', delay: 190 },
    { char: 'S', delay: 220 },
    { char: 'T', delay: 250 },
    { char: 'E', delay: 280 },
    { char: 'R', delay: 310 },
    { char: '®', delay: 360, isSup: true },
  ];

  return (
    <aside
      role="status"
      aria-label="Carregando..."
      aria-live="polite"
      className={`fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center overflow-hidden transition-all duration-700 will-change-[opacity,transform] ${
        stage === 'fading'
          ? 'opacity-0 scale-[1.03] pointer-events-none'
          : 'opacity-100 scale-100 pointer-events-auto'
      }`}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.45, 0, 0.55, 1)',
      }}
    >
      {/* Ambient Cinema Blue Glow */}
      <div
        className={`absolute w-80 h-80 rounded-full bg-[#0071e3] blur-[120px] pointer-events-none transition-all duration-1000 ${
          isMorphingOrBeyond ? 'opacity-25 scale-125' : 'opacity-15 scale-90'
        }`}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
        }}
      />

      {/* Retícula Overlay for unified visual language */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40 z-1"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255, 255, 255, 0.25) 1px, transparent 1px)`,
          backgroundSize: '6px 6px',
        }}
      />

      {/* Center Animated Logo Container */}
      <div className="relative z-10 flex items-center justify-center select-none px-4">
        {/* FLMMKR Layer (Slides UP and fades out) */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden={isMorphingOrBeyond}
        >
          <div className="flex items-center tracking-[0.16em] font-black text-3xl sm:text-5xl md:text-6xl text-white">
            {flmmkrLetters.map((letter, idx) => (
              <span
                key={idx}
                className="inline-block overflow-hidden transition-all duration-600 will-change-transform"
                style={{
                  transform: isMorphingOrBeyond ? 'translate3d(0, -130%, 0)' : 'translate3d(0, 0%, 0)',
                  opacity: isMorphingOrBeyond ? 0 : 1,
                  transitionDelay: `${idx * 35}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                }}
              >
                {letter}
              </span>
            ))}
          </div>
        </div>

        {/* COLOR MASTER® Layer (Slides UP from below with accentuated quadratic acceleration) */}
        <div
          className="flex items-center font-black tracking-tight text-3xl sm:text-5xl md:text-6xl text-white"
          aria-hidden={!isMorphingOrBeyond}
        >
          {colorMasterLetters.map((item, idx) => {
            if (item.isSpace) {
              return <span key={idx} className="w-2.5 sm:w-4" />;
            }
            if (item.isSup) {
              return (
                <span
                  key={idx}
                  className="inline-block text-sm sm:text-xl md:text-2xl text-white ml-1 self-start font-bold transition-all duration-600 will-change-transform"
                  style={{
                    transform: isMorphingOrBeyond ? 'translate3d(0, 0%, 0) scale(1)' : 'translate3d(0, 150%, 0) scale(0.6)',
                    opacity: isMorphingOrBeyond ? 1 : 0,
                    transitionDelay: `${item.delay}ms`,
                    transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                  }}
                >
                  {item.char}
                </span>
              );
            }
            return (
              <span
                key={idx}
                className="inline-block overflow-hidden transition-all duration-600 will-change-transform"
                style={{
                  transform: isMorphingOrBeyond ? 'translate3d(0, 0%, 0)' : 'translate3d(0, 140%, 0)',
                  opacity: isMorphingOrBeyond ? 1 : 0,
                  transitionDelay: `${item.delay}ms`,
                  transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
                }}
              >
                {item.char}
              </span>
            );
          })}
        </div>
      </div>

      {/* Subtle bottom loading line */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-36 h-[2px] bg-white/10 rounded-full overflow-hidden z-10">
        <div
          className="h-full bg-gradient-to-r from-[#0071e3] to-[#2997ff] rounded-full transition-all duration-1000 ease-out"
          style={{
            width: isMorphingOrBeyond ? '100%' : '35%',
            transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)',
          }}
        />
      </div>
    </aside>
  );
};
