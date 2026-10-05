'use client';

import React from 'react';

interface ReticulaBackgroundProps {
  bgImageSrc: string;
  className?: string;
  crossfadeScroll?: boolean;
  fadeFromColor?: string;
  fadeToColor?: string;
  targetBlockRef?: React.RefObject<HTMLDivElement | null>;
}

export const ReticulaBackground: React.FC<ReticulaBackgroundProps> = ({
  bgImageSrc,
  className = '',
}) => {
  if (!bgImageSrc) return null;

  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
    >
      {/* Camada da Foto de Fundo */}
      <div
        className="absolute inset-0 bg-cover bg-center w-full h-full pointer-events-none"
        style={{
          backgroundImage: `url('${bgImageSrc}')`,
        }}
      />

      {/* Camada de Retícula de Pontos Pretos (Responsiva: menor no mobile, padrão no desktop) */}
      <div className="absolute inset-0 z-1 pointer-events-none reticula-pattern" />
    </div>
  );
};
