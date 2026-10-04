'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ReticulaBackgroundProps {
  bgImageSrc: string;
  className?: string;
  crossfadeScroll?: boolean;
  fadeFromColor?: string; // Default: '#f5f5f7' (White)
  fadeToColor?: string;   // Default: '#000000' (Dark)
}

export const ReticulaBackground: React.FC<ReticulaBackgroundProps> = ({
  bgImageSrc,
  className = '',
  crossfadeScroll = true,
  fadeFromColor = '#f5f5f7',
  fadeToColor = '#000000',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [whiteOpacity, setWhiteOpacity] = useState<number>(0);
  const [blackOpacity, setBlackOpacity] = useState<number>(0);

  useEffect(() => {
    if (!crossfadeScroll) {
      setWhiteOpacity(0);
      setBlackOpacity(0);
      return;
    }

    let animationFrameId: number;

    const updateScrollFade = () => {
      if (!containerRef.current) return;
      const parentEl = containerRef.current.parentElement || containerRef.current;
      const rect = parentEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Distância do centro da seção até o centro da janela de visualização
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const centerOffset = elementCenter - viewportCenter;

      // Zona de transição (alcance dinâmico para fade orgânico)
      const transitionZone = Math.max(windowHeight * 0.5, rect.height * 0.45);

      if (centerOffset > 0) {
        // 1. CHEGADA (Entrando a partir da seção branca anterior):
        // Conforme a seção sobe até o centro, a camada branca desvanece de 1 -> 0, revelando a imagem.
        const rawWhite = Math.min(1, Math.max(0, centerOffset / transitionZone));
        const easedWhite =
          rawWhite < 0.5 ? 2 * rawWhite * rawWhite : 1 - Math.pow(-2 * rawWhite + 2, 2) / 2;
        setWhiteOpacity(easedWhite);
        setBlackOpacity(0);
      } else {
        // 2. SAÍDA (Rolando em direção à seção escura seguinte):
        // Conforme a seção passa do centro em direção ao topo, a camada preta surge de 0 -> 1, escurecendo a imagem.
        const rawBlack = Math.min(1, Math.max(0, -centerOffset / transitionZone));
        const easedBlack =
          rawBlack < 0.5 ? 2 * rawBlack * rawBlack : 1 - Math.pow(-2 * rawBlack + 2, 2) / 2;
        setWhiteOpacity(0);
        setBlackOpacity(easedBlack);
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateScrollFade);
    };

    updateScrollFade();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [crossfadeScroll]);

  if (!bgImageSrc) return null;

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* Camada da Foto de Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full pointer-events-none will-change-transform"
        style={{
          backgroundImage: `url('${bgImageSrc}')`,
        }}
      />

      {/* Camada de Retícula de Pontos Pretos */}
      <div
        className="absolute inset-0 z-1 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(0, 0, 0, 0.8) 1.2px, transparent 1.2px)`,
          backgroundSize: '5px 5px',
        }}
      />

      {/* Camada de Animação de Fade: Branco -> Imagem */}
      <div
        className="absolute inset-0 z-2 pointer-events-none will-change-[opacity]"
        style={{
          backgroundColor: fadeFromColor,
          opacity: whiteOpacity,
        }}
      />

      {/* Camada de Animação de Fade: Imagem -> Escuro/Preto */}
      <div
        className="absolute inset-0 z-2 pointer-events-none will-change-[opacity]"
        style={{
          backgroundColor: fadeToColor,
          opacity: blackOpacity,
        }}
      />
    </div>
  );
};
