'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ReticulaBackgroundProps {
  bgImageSrc: string;
  className?: string;
  alwaysVisible?: boolean;
  topFadeColor?: string;
  bottomFadeColor?: string;
}

export const ReticulaBackground: React.FC<ReticulaBackgroundProps> = ({
  bgImageSrc,
  className = '',
  alwaysVisible = false,
  topFadeColor,
  bottomFadeColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState<number>(alwaysVisible ? 1 : 0);

  useEffect(() => {
    if (alwaysVisible) {
      setOpacity(1);
      return;
    }

    let animationFrameId: number;

    const updateScrollOpacity = () => {
      if (!containerRef.current) return;
      const parentEl = containerRef.current.parentElement || containerRef.current;
      const rect = parentEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Center of the parent section relative to viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = Math.abs(elementCenter - viewportCenter);

      // Distance threshold: image + reticula are 100% visible near center, fade to 0 near edges
      const fadeZone = rect.height / 2 + windowHeight * 0.2;

      let calcOpacity = 1 - distanceFromCenter / fadeZone;
      calcOpacity = Math.max(0, Math.min(1, calcOpacity));

      // Ease-in-out curve for smooth organic fade transition
      const easedOpacity = calcOpacity < 0.5
        ? 2 * calcOpacity * calcOpacity
        : 1 - Math.pow(-2 * calcOpacity + 2, 2) / 2;

      setOpacity(easedOpacity);
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollOpacity);
    };

    updateScrollOpacity();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [alwaysVisible]);

  if (!bgImageSrc) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 transition-opacity duration-300 ease-out ${className}`}
      style={{ opacity: alwaysVisible ? 1 : opacity }}
    >
      {/* Pure Background Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full"
        style={{
          backgroundImage: `url('${bgImageSrc}')`,
        }}
      />

      {/* Pure Retícula Overlay (Black dots grid filter) */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.8) 1.2px, transparent 1.2px)`,
          backgroundSize: '5px 5px',
        }}
      />

      {/* Optional Top Fade Gradient for seamless section entrance */}
      {topFadeColor && (
        <div
          className="absolute inset-x-0 top-0 h-32 pointer-events-none z-2"
          style={{
            background: `linear-gradient(to bottom, ${topFadeColor} 0%, transparent 100%)`,
          }}
        />
      )}

      {/* Optional Bottom Fade Gradient for seamless section transition (e.g. to dark section) */}
      {bottomFadeColor && (
        <div
          className="absolute inset-x-0 bottom-0 h-44 pointer-events-none z-2"
          style={{
            background: `linear-gradient(to bottom, transparent 0%, ${bottomFadeColor} 100%)`,
          }}
        />
      )}
    </div>
  );
};
