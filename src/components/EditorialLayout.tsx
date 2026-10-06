'use client';

import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface EditorialSectionProps {
  kickerLeft?: string;
  kickerRight?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Seção Editorial estilo Página de Jornal ou Revista Impressa
 */
export const EditorialSection: React.FC<EditorialSectionProps> = ({
  kickerLeft = 'FLMMKR · COLOR MASTER',
  kickerRight = 'EDITORIAL',
  title,
  subtitle,
  children,
  className = '',
}) => {
  return (
    <section className={`w-full bg-white p-6 sm:p-10 lg:p-12 border border-neutral-200/80 rounded-[28px] shadow-sm relative overflow-hidden transition-all duration-300 ${className}`}>
      {/* Kicker Superior de Jornal / Revista */}
      <div className="font-serif text-[12px] sm:text-[13px] tracking-[0.25em] uppercase text-neutral-500 font-medium mb-4 flex items-center justify-between border-b border-neutral-300/60 pb-3">
        <span>{kickerLeft}</span>
        <span>{kickerRight}</span>
      </div>

      {/* Manchete Principal */}
      <h2 className="font-sans font-black text-[28px] sm:text-[38px] lg:text-[46px] tracking-tight uppercase leading-[0.95] text-[#0071e3] my-3">
        {title}
      </h2>

      {/* Subtítulo / Linha Fina Editorial */}
      {subtitle && (
        <h3 className="font-sans font-bold text-neutral-900 text-base sm:text-xl uppercase tracking-tight mt-1 mb-4">
          {subtitle}
        </h3>
      )}

      {/* Fio Divisório de Jornal Impresso */}
      <div className="h-[2px] bg-[#0071e3] w-full my-6" />

      {/* Conteúdo Editorial da Seção */}
      <div className="space-y-6">
        {children}
      </div>
    </section>
  );
};

interface TwoColumnTextProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

/**
 * Bloco de 2 Colunas de Texto estilo Impresso
 */
export const TwoColumnText: React.FC<TwoColumnTextProps> = ({
  left,
  right,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 font-serif text-lg text-neutral-800 leading-[1.65] ${className}`}>
      <div className="space-y-5">
        {left}
      </div>
      <div className="space-y-5">
        {right}
      </div>
    </div>
  );
};

interface ImageAndTextProps {
  imageSrc?: string;
  imageAlt?: string;
  caption?: string;
  imagePosition?: 'left' | 'right';
  children: React.ReactNode;
  aspectRatio?: string;
  className?: string;
}

/**
 * Bloco de 1 Foto Editorial + 1 Coluna de Texto ao Lado
 */
export const ImageAndText: React.FC<ImageAndTextProps> = ({
  imageSrc,
  imageAlt = 'Ilustração do DaVinci Resolve',
  caption,
  imagePosition = 'left',
  children,
  aspectRatio,
  className = '',
}) => {
  const imageElement = (
    <div className="w-full space-y-2">
      {imageSrc ? (
        <div className="w-full bg-neutral-950/50 rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs relative group flex items-center justify-center">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="w-full h-auto block transition-transform duration-500 group-hover:scale-[1.02]"
          />
          {caption && (
            <div className="absolute bottom-3 right-3 text-[11px] font-sans text-white/90 italic backdrop-blur-md bg-black/60 px-3 py-1 rounded-full border border-white/20">
              {caption}
            </div>
          )}
        </div>
      ) : (
        <div className={`w-full ${aspectRatio || 'aspect-video sm:aspect-4/3'} bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200/80 shadow-xs relative flex items-center justify-center`}>
          <div className="flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white/60 border border-white/10">
              <ImageIcon size={22} />
            </div>
            <span className="font-sans text-xs text-white/80 font-medium uppercase tracking-wider">{imageAlt}</span>
            <span className="font-serif italic text-[11px] text-neutral-400">Espaço preparado para imagem editorial</span>
          </div>
          {caption && (
            <p className="font-sans text-[11px] text-neutral-500 italic text-center">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );

  const textElement = (
    <div className="space-y-5 font-serif text-lg text-neutral-800 leading-[1.65]">
      {children}
    </div>
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-start my-4 ${className}`}>
      {imagePosition === 'left' ? (
        <>
          {imageElement}
          {textElement}
        </>
      ) : (
        <>
          {textElement}
          {imageElement}
        </>
      )}
    </div>
  );
};

interface EditorialQuoteProps {
  quote: string;
  author?: string;
  variant?: 'light' | 'blue';
  className?: string;
}

/**
 * Citação em Destaque Editorial (Pull Quote)
 */
export const EditorialQuote: React.FC<EditorialQuoteProps> = ({
  quote,
  author,
  variant = 'light',
  className = '',
}) => {
  if (variant === 'blue') {
    return (
      <blockquote className={`bg-[#0071e3] text-white p-8 sm:p-10 rounded-2xl my-7 shadow-md transition-all duration-300 ${className}`}>
        <p className="font-serif italic font-medium text-xl sm:text-2xl leading-snug text-center !mb-0">
          “{quote}”
        </p>
        {author && (
          <cite className="block font-sans text-xs text-blue-100 uppercase tracking-widest mt-3 text-center not-italic font-semibold">
            — {author}
          </cite>
        )}
      </blockquote>
    );
  }

  return (
    <blockquote className={`bg-[#f5f5f7] p-6 sm:p-8 rounded-2xl border-l-4 border-[#0071e3] my-6 shadow-xs ${className}`}>
      <p className="font-serif italic font-medium text-xl sm:text-2xl text-[#0071e3] leading-snug !mb-0">
        “{quote}”
      </p>
      {author && (
        <cite className="block font-sans text-xs text-neutral-500 uppercase tracking-widest mt-2 not-italic font-semibold">
          — {author}
        </cite>
      )}
    </blockquote>
  );
};

interface FullWidthImageProps {
  src?: string;
  alt: string;
  caption?: string;
  className?: string;
}

/**
 * Imagem Editorial de Largura Total
 */
export const FullWidthImage: React.FC<FullWidthImageProps> = ({
  src,
  alt,
  caption,
  className = '',
}) => {
  return (
    <div className={`w-full bg-neutral-950/50 overflow-hidden relative rounded-2xl border border-neutral-200/80 my-6 shadow-xs ${className}`}>
      {src ? (
        <img src={src} alt={alt} className="w-full h-auto block" />
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-neutral-400 p-6 text-center space-y-2">
          <Camera size={28} className="text-white/60" />
          <span className="font-sans text-xs text-white/80 font-medium uppercase tracking-wider">{alt}</span>
          <span className="font-serif italic text-xs text-neutral-400">Espaço preparado para imagem editorial em largura total</span>
        </div>
      )}
      {caption && (
        <div className="absolute bottom-3 right-4 text-[12px] font-sans text-white/90 italic backdrop-blur-md bg-black/50 px-3 py-1 rounded-full border border-white/20">
          {caption}
        </div>
      )}
    </div>
  );
};
