'use client';

import React, { useEffect, useRef } from 'react';

interface ReticulaBackgroundProps {
  bgImageSrc: string;
  className?: string;
  crossfadeScroll?: boolean;
  fadeFromColor?: string; // Default: '#f5f5f7' (White)
  fadeToColor?: string;   // Default: '#000000' (Dark)
  targetBlockRef?: React.RefObject<HTMLDivElement | null>;
}

export const ReticulaBackground: React.FC<ReticulaBackgroundProps> = ({
  bgImageSrc,
  className = '',
  crossfadeScroll = true,
  fadeFromColor = '#f5f5f7',
  fadeToColor = '#000000',
  targetBlockRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const whiteLayerRef = useRef<HTMLDivElement>(null);
  const blackLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!crossfadeScroll) {
      if (whiteLayerRef.current) whiteLayerRef.current.style.opacity = '0';
      if (blackLayerRef.current) blackLayerRef.current.style.opacity = '0';
      if (targetBlockRef?.current) targetBlockRef.current.style.opacity = '1';
      return;
    }

    let animationFrameId: number;

    const updateScrollFade = () => {
      if (!containerRef.current) return;

      const isMobileOrTablet = typeof window !== 'undefined' && window.innerWidth <= 1180;
      const prefersReduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // No modo mobile e tablet (até 1180px) ou com movimento reduzido, desativa totalmente as animações de scroll
      if (isMobileOrTablet || prefersReduced) {
        if (whiteLayerRef.current) whiteLayerRef.current.style.opacity = '0';
        if (blackLayerRef.current) blackLayerRef.current.style.opacity = '0';
        if (targetBlockRef?.current) targetBlockRef.current.style.opacity = '1';
        return;
      }

      const parentEl = containerRef.current.parentElement || containerRef.current;
      const rect = parentEl.getBoundingClientRect();
      const windowHeight = window.innerHeight || 800;

      // Distância do centro da seção até o centro da janela de visualização
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const centerOffset = elementCenter - viewportCenter;

      // Zona de transição para saída suave ao scrollar para a próxima seção
      const transitionZone = Math.max(windowHeight * 0.5, rect.height * 0.45);
      const deadZone = transitionZone * 0.15; // Janela estável de leitura no centro

      let whiteVal = 0;
      let blackVal = 0;
      let blockVal = 1;

      if (centerOffset < -deadZone) {
        // SAÍDA (Rolando em direção à seção escura seguinte):
        // Conforme a seção sobe para sair da tela, o preto surge de 0 -> 1,
        // e o bloco do instrutor apaga/some junto com o resto dissolvendo no preto.
        const rawProgress = Math.min(1, Math.max(0, (-centerOffset - deadZone) / (transitionZone - deadZone)));
        const eased = rawProgress < 0.5 ? 2 * rawProgress * rawProgress : 1 - Math.pow(-2 * rawProgress + 2, 2) / 2;
        whiteVal = 0;
        blackVal = eased;
        blockVal = Math.max(0, Math.min(1, 1 - eased));
      } else {
        // ENTRADA E CENTRO:
        // A seção e o bloco do INSTRUTOR DA MASTERCLASS aparecem imediatamente com 100% de visibilidade.
        whiteVal = 0;
        blackVal = 0;
        blockVal = 1;
      }

      if (whiteLayerRef.current) {
        whiteLayerRef.current.style.opacity = whiteVal.toString();
      }
      if (blackLayerRef.current) {
        blackLayerRef.current.style.opacity = blackVal.toString();
      }
      if (targetBlockRef?.current) {
        targetBlockRef.current.style.opacity = blockVal.toString();
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
  }, [crossfadeScroll, targetBlockRef]);

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

      {/* Camada de Retícula de Pontos Pretos (Responsiva: menor no mobile, padrão no desktop) */}
      <div className="absolute inset-0 z-1 pointer-events-none reticula-pattern" />

      {/* Camada de Animação de Fade: Branco -> Imagem */}
      <div
        ref={whiteLayerRef}
        className="absolute inset-0 z-2 pointer-events-none will-change-[opacity]"
        style={{
          backgroundColor: fadeFromColor,
          opacity: 0,
        }}
      />

      {/* Camada de Animação de Fade: Imagem -> Escuro/Preto */}
      <div
        ref={blackLayerRef}
        className="absolute inset-0 z-2 pointer-events-none will-change-[opacity]"
        style={{
          backgroundColor: fadeToColor,
          opacity: 0,
        }}
      />
    </div>
  );
};
