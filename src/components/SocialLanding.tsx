'use client';

import React, { useEffect, useState } from 'react';
import { PRODUCTS, Product } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';
import { SocialPlatform } from '@/utils/detectBrowser';
import { trackProductClick, trackSocialClick, trackPageView } from '@/utils/analytics';
import { InstagramIcon, YouTubeIcon, TikTokIcon } from '@/components/SocialIcons';
import { ReticulaBackground } from '@/components/ReticulaBackground';
import { getRandomAuthorPhotos, AuthorPhotoPair } from '@/utils/authorPhotos';
import {
  Play,
  Film,
  Sliders,
  Camera,
  Smartphone,
  ChevronRight,
  Check
} from 'lucide-react';

interface SocialLandingProps {
  platform: SocialPlatform;
  onSwitchToOfficial?: () => void;
}

const ICON_MAP = {
  play: Play,
  film: Film,
  sliders: Sliders,
  camera: Camera,
  smartphone: Smartphone
};

// Slideshow images for Color Master - Produtos thumbnail
const PRODUTO_SLIDES = [
  '/assets/produtos/color-grade-produto/01.jpg',
  '/assets/produtos/color-grade-produto/02.jpg',
  '/assets/produtos/color-grade-produto/03.jpg',
];

// Slideshow images for Produção de Vídeo para Empreendedores thumbnail
const EMPREENDEDORES_SLIDES = [
  '/assets/produtos/empreendedores/01.jpg',
  '/assets/produtos/empreendedores/02.jpg',
  '/assets/produtos/empreendedores/03.jpg',
  '/assets/produtos/empreendedores/04.jpg',
  '/assets/produtos/empreendedores/06.jpg',
  '/assets/produtos/empreendedores/07.jpg',
  '/assets/produtos/empreendedores/08.jpg',
  '/assets/produtos/empreendedores/09.jpg',
];

export const SocialLanding: React.FC<SocialLandingProps> = ({
  platform,
  onSwitchToOfficial
}) => {
  const [authorPhotos, setAuthorPhotos] = useState<AuthorPhotoPair>({
    profileSrc: '/assets/mike-photos/01.jpg',
    bgSrc: '/assets/bg/about-mike/02.jpg'
  });

  // Crossfade slideshows — randomized initial image on mount/refresh + 60s cycle
  const [slideIndex, setSlideIndex] = useState(0);
  const [empSlideIndex, setEmpSlideIndex] = useState(0);

  useEffect(() => {
    setAuthorPhotos(getRandomAuthorPhotos());
    setSlideIndex(Math.floor(Math.random() * PRODUTO_SLIDES.length));
    setEmpSlideIndex(Math.floor(Math.random() * EMPREENDEDORES_SLIDES.length));
  }, []);

  // Advance slides every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % PRODUTO_SLIDES.length);
      setEmpSlideIndex((prev) => (prev + 1) % EMPREENDEDORES_SLIDES.length);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    trackPageView('social', platform);
  }, [platform]);

  const handleProductClick = (product: Product) => {
    trackProductClick(product.id, product.name, product.url, platform);
  };

  const handleSocialClick = (name: string) => {
    trackSocialClick(name, platform);
  };

  return (
    <main className="relative min-h-screen bg-[#f5f5f7] text-[#1d1d1f] flex flex-col items-center justify-between px-4 py-8 md:py-12 selection:bg-[#0071e3]/20 selection:text-[#0071e3] overflow-hidden">
      <ReticulaBackground bgImageSrc={authorPhotos.bgSrc} />

      <div className="w-full max-w-md mx-auto z-10 flex flex-col items-center flex-1 relative z-10">
        {/* Header / Avatar & Profile Info */}
        <header className="flex flex-col items-center text-center mt-2 mb-8 w-full">
          {/* Avatar Photo */}
          <div className="relative mb-4 group">
            <div className="w-28 md:w-32 rounded-2xl border border-[#d2d2d7] bg-[#ffffff] shadow-md overflow-hidden">
              <img
                src={authorPhotos.profileSrc}
                alt={SITE_CONFIG.author.name}
                className="w-full h-auto object-contain block rounded-2xl"
              />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#1d1d1f] flex items-center gap-1.5 justify-center drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)]">
            {SITE_CONFIG.author.name}
            <Check className="w-5 h-5 text-[#0071e3] shrink-0" />
          </h1>

          <p className="text-xs md:text-sm font-medium text-[#1d1d1f] tracking-tight mt-1.5 px-3.5 py-1 bg-[#ffffff] border border-[#d2d2d7] rounded-full shadow-xs">
            Treinamentos Audiovisual
          </p>

          {/* Platform Origin Badge */}
          {platform !== 'other' && (
            <div className="mt-3 text-[11px] text-[#6e6e73] flex items-center gap-1.5 bg-[#ffffff] px-3 py-1 rounded-full border border-[#d2d2d7] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Acesso via {platform === 'instagram' ? 'Instagram' : 'TikTok'}
            </div>
          )}
        </header>

        {/* Vertical Product Buttons List */}
        <section className="w-full space-y-3.5 my-auto" aria-label="Lista de Treinamentos e Produtos">
          {[...PRODUCTS]
            .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0))
            .map((product) => {
            const IconComponent = ICON_MAP[product.iconName] || Play;
            const isHighlighted = product.featured;

            return (
              <a
                key={product.id}
                href={product.url}
                onClick={() => handleProductClick(product)}
                className={`group relative w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 text-left border ${
                  isHighlighted
                    ? 'bg-[#ffffff] border-[#0071e3] ring-1 ring-[#0071e3] shadow-md'
                    : 'bg-[#ffffff] hover:bg-[#fafafa] border-[#e5e5e7] hover:border-[#d2d2d7] shadow-xs'
                } active:scale-[0.98]`}
              >
                <div className="flex items-center gap-3.5 pr-2">
                  {/* Thumbnail / Icon Container */}
                  <div
                    className={`w-12 h-12 rounded-xl relative overflow-hidden flex items-center justify-center shrink-0 border ${
                      isHighlighted
                        ? 'bg-[#0071e3]/10 border-[#0071e3]/30 text-[#0071e3]'
                        : 'bg-[#f5f5f7] border-[#d2d2d7] text-[#6e6e73] group-hover:text-[#1d1d1f]'
                    } ${
                      product.isAvailable
                        ? 'grayscale-0'
                        : 'grayscale group-hover:grayscale-0'
                    } transition-all duration-500`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {product.id === 'color-master-produto' ? (
                      /* All slides stacked — CSS opacity crossfade */
                      PRODUTO_SLIDES.map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt={i === 0 ? product.name : ''}
                          aria-hidden={i !== 0}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            opacity: i === slideIndex ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            zIndex: i === slideIndex ? 2 : 1,
                          }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ))
                    ) : product.id === 'producao-de-video-para-empreendedores' ? (
                      /* Empreendedores stacked slides crossfade */
                      EMPREENDEDORES_SLIDES.map((src, i) => (
                        <img
                          key={src}
                          src={src}
                          alt={i === 0 ? product.name : ''}
                          aria-hidden={i !== 0}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            opacity: i === empSlideIndex ? 1 : 0,
                            transition: 'opacity 1s ease-in-out',
                            zIndex: i === empSlideIndex ? 2 : 1,
                          }}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      ))
                    ) : product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col">
                    <span className="font-semibold text-sm md:text-base text-[#1d1d1f] group-hover:text-[#0071e3] leading-snug transition-colors">
                      {product.name}
                    </span>
                    <span className="text-xs text-[#6e6e73] line-clamp-1 mt-0.5">
                      {product.socialDescription}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-[#86868b] group-hover:text-[#0071e3] group-hover:translate-x-0.5 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </a>
            );
          })}
        </section>

        {/* Secondary Social Networks */}
        <footer className="w-full mt-8 pt-6 border-t border-[#d2d2d7]/60 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-3">
            {SITE_CONFIG.social.map((soc) => (
              <a
                key={soc.name}
                href={soc.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleSocialClick(soc.name)}
                className="w-10 h-10 rounded-full bg-[#ffffff] border border-[#d2d2d7] flex items-center justify-center text-[#6e6e73] hover:text-[#0071e3] hover:border-[#0071e3] shadow-xs transition-colors"
                aria-label={soc.name}
              >
                {soc.name === 'Instagram' && <InstagramIcon className="w-4 h-4" />}
                {soc.name === 'YouTube' && <YouTubeIcon className="w-4 h-4" />}
                {soc.name === 'TikTok' && <TikTokIcon className="w-4 h-4" />}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#86868b]">
            <span className="font-semibold text-[#1d1d1f]">FLMMKR</span>
            <span>•</span>
            {onSwitchToOfficial ? (
              <button
                onClick={onSwitchToOfficial}
                className="text-[#0071e3] hover:underline font-medium"
              >
                Ver site completo
              </button>
            ) : (
              <a href="/" className="text-[#0071e3] hover:underline font-medium">
                Ver site completo
              </a>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
};
