'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Product } from '@/config/products';
import { ChevronLeft, ChevronRight, Check, Play, Film, Sliders, Camera, Smartphone } from 'lucide-react';

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

// ============================================================================
// MACOS DOCK MAGNIFICATION CONSTANTS (Easy to tune)
// ============================================================================
export const DOCK_CONFIG = {
  MAX_SCALE: 1.14,         // Max magnification scale (subtle, elegant, fits container headroom)
  MAX_DISTANCE: 380,       // Radius of influence (~2 to 2.5x item width)
  STIFFNESS: 320,          // Snappy spring stiffness for instant responsiveness
  DAMPING: 22,             // Critically damped to eliminate sluggishness
  MASS: 0.35,              // Ultra-light mass for instant response
  ITEM_BASE_WIDTH: 360,    // Default fallback width
};

interface DockCarouselProps {
  products: Product[];
  onProductClick: (product: Product) => void;
}

const ICON_MAP = {
  play: Play,
  film: Film,
  sliders: Sliders,
  camera: Camera,
  smartphone: Smartphone
};

export const DockCarousel: React.FC<DockCarouselProps> = ({
  products,
  onProductClick
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Physics state refs (prevents React render lag for rock-solid 60/120 FPS)
  const currentScalesRef = useRef<number[]>([]);
  const velocityScalesRef = useRef<number[]>([]);
  const targetScalesRef = useRef<number[]>([]);

  const currentTxRef = useRef<number[]>([]);
  const velocityTxRef = useRef<number[]>([]);
  const targetTxRef = useRef<number[]>([]);

  const rafIdRef = useRef<number | null>(null);
  const mousePosRef = useRef<number | null>(null);

  // Crossfade slideshows — randomized initial image on mount/refresh + 60s cycle
  const [slideIndex, setSlideIndex] = useState(0);
  const [empSlideIndex, setEmpSlideIndex] = useState(0);

  // Randomize initial image on load / page refresh
  useEffect(() => {
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

  // Initialize arrays on product count change
  useEffect(() => {
    const count = products.length;
    currentScalesRef.current = new Array(count).fill(1);
    velocityScalesRef.current = new Array(count).fill(0);
    targetScalesRef.current = new Array(count).fill(1);

    currentTxRef.current = new Array(count).fill(0);
    velocityTxRef.current = new Array(count).fill(0);
    targetTxRef.current = new Array(count).fill(0);
  }, [products.length]);

  // Center carousel on featured product on mount & window resize
  useEffect(() => {
    const centerOnProduct = () => {
      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const targetIndex = products.findIndex((p) => p.featured) !== -1
          ? products.findIndex((p) => p.featured)
          : Math.floor(products.length / 2);

        const targetEl = itemRefs.current[targetIndex];
        if (targetEl) {
          const scrollPos = targetEl.offsetLeft - (container.clientWidth - targetEl.offsetWidth) / 2;
          container.scrollTo({ left: Math.max(0, scrollPos), behavior: 'instant' });
        }
      }
    };

    const timer = setTimeout(centerOnProduct, 50);
    window.addEventListener('resize', centerOnProduct);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', centerOnProduct);
    };
  }, [products]);

  // Spring Physics Animation Loop (Runs in rAF & updates DOM directly for maximum FPS)
  const startPhysicsLoop = () => {
    if (rafIdRef.current !== null) return;

    const step = () => {
      const count = products.length;
      let isSettled = true;

      // 2 integration substeps per frame for ultra-smooth spring stability
      const dt = 0.016 / 2;

      for (let sub = 0; sub < 2; sub++) {
        for (let i = 0; i < count; i++) {
          // Scale Spring
          const fScale = -DOCK_CONFIG.STIFFNESS * (currentScalesRef.current[i] - targetScalesRef.current[i]) - DOCK_CONFIG.DAMPING * velocityScalesRef.current[i];
          const aScale = fScale / DOCK_CONFIG.MASS;
          velocityScalesRef.current[i] += aScale * dt;
          currentScalesRef.current[i] += velocityScalesRef.current[i] * dt;

          // TranslateX Spring
          const fTx = -DOCK_CONFIG.STIFFNESS * (currentTxRef.current[i] - targetTxRef.current[i]) - DOCK_CONFIG.DAMPING * velocityTxRef.current[i];
          const aTx = fTx / DOCK_CONFIG.MASS;
          velocityTxRef.current[i] += aTx * dt;
          currentTxRef.current[i] += velocityTxRef.current[i] * dt;
        }
      }

      // Apply transformations to DOM & check settling
      for (let i = 0; i < count; i++) {
        const el = itemRefs.current[i];
        if (el) {
          const s = currentScalesRef.current[i];
          const tx = currentTxRef.current[i];

          el.style.transform = `translate3d(${tx.toFixed(2)}px, 0px, 0px) scale(${s.toFixed(4)})`;
          el.style.zIndex = `${Math.round(s * 100)}`;
        }

        // Check if item has come to rest
        if (
          Math.abs(currentScalesRef.current[i] - targetScalesRef.current[i]) > 0.0001 ||
          Math.abs(velocityScalesRef.current[i]) > 0.0001 ||
          Math.abs(currentTxRef.current[i] - targetTxRef.current[i]) > 0.01 ||
          Math.abs(velocityTxRef.current[i]) > 0.01
        ) {
          isSettled = false;
        }
      }

      if (!isSettled) {
        rafIdRef.current = requestAnimationFrame(step);
      } else {
        // Snap to exact target when settled to stop rAF loop and save CPU
        for (let i = 0; i < count; i++) {
          currentScalesRef.current[i] = targetScalesRef.current[i];
          velocityScalesRef.current[i] = 0;
          currentTxRef.current[i] = targetTxRef.current[i];
          velocityTxRef.current[i] = 0;

          const el = itemRefs.current[i];
          if (el) {
            el.style.transform = `translate3d(${targetTxRef.current[i].toFixed(2)}px, 0px, 0px) scale(${targetScalesRef.current[i].toFixed(4)})`;
            el.style.zIndex = `${Math.round(targetScalesRef.current[i] * 100)}`;
          }
        }
        rafIdRef.current = null;
      }
    };

    rafIdRef.current = requestAnimationFrame(step);
  };

  // Recalculate target scales & translateXs based on mouse X position
  const updateTargets = (mouseX: number | null) => {
    const count = products.length;

    // Accessibility check: reduced motion or touch device
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    if (mouseX === null || prefersReducedMotion || isTouchDevice) {
      for (let i = 0; i < count; i++) {
        targetScalesRef.current[i] = 1;
        targetTxRef.current[i] = 0;
      }
      startPhysicsLoop();
      return;
    }

    // 1. Calculate target scale for each item (Cosine Bell-Curve Wave)
    for (let i = 0; i < count; i++) {
      const el = itemRefs.current[i];
      if (!el) {
        targetScalesRef.current[i] = 1;
        continue;
      }

      const itemLeft = el.offsetLeft;
      const itemWidth = el.offsetWidth;
      const itemCenter = itemLeft + itemWidth / 2;
      const distance = Math.abs(mouseX - itemCenter);

      if (distance < DOCK_CONFIG.MAX_DISTANCE) {
        const norm = distance / DOCK_CONFIG.MAX_DISTANCE;
        const factor = Math.cos((norm * Math.PI) / 2);
        const quadFactor = Math.pow(factor, 1.5); // Parabolic bell-curve
        targetScalesRef.current[i] = 1 + quadFactor * (DOCK_CONFIG.MAX_SCALE - 1);
      } else {
        targetScalesRef.current[i] = 1;
      }
    }

    // 2. Calculate target horizontal expansions & cumulative translateX
    const expansions = new Array<number>(count).fill(0);
    for (let i = 0; i < count; i++) {
      const el = itemRefs.current[i];
      const width = el ? el.offsetWidth : DOCK_CONFIG.ITEM_BASE_WIDTH;
      expansions[i] = (targetScalesRef.current[i] - 1) * width;
    }

    const rawTranslate = new Array<number>(count).fill(0);
    for (let i = 1; i < count; i++) {
      rawTranslate[i] = rawTranslate[i - 1] + (expansions[i - 1] + expansions[i]) / 2;
    }

    let totalWeight = 0;
    let weightedShiftSum = 0;
    for (let i = 0; i < count; i++) {
      const weight = targetScalesRef.current[i] - 1;
      totalWeight += weight;
      weightedShiftSum += rawTranslate[i] * weight;
    }

    const focalShift = totalWeight > 0 ? weightedShiftSum / totalWeight : 0;

    for (let i = 0; i < count; i++) {
      targetTxRef.current[i] = rawTranslate[i] - focalShift;
    }

    startPhysicsLoop();
  };

  const edgeScrollRafRef = useRef<number | null>(null);
  const edgeScrollSpeedRef = useRef<number>(0);

  const stopEdgeScroll = () => {
    if (edgeScrollRafRef.current !== null) {
      cancelAnimationFrame(edgeScrollRafRef.current);
      edgeScrollRafRef.current = null;
    }
    edgeScrollSpeedRef.current = 0;
  };

  const startEdgeScroll = () => {
    if (edgeScrollRafRef.current !== null) return;
    const scrollStep = () => {
      if (scrollContainerRef.current && Math.abs(edgeScrollSpeedRef.current) > 0) {
        scrollContainerRef.current.scrollLeft += edgeScrollSpeedRef.current;
        edgeScrollRafRef.current = requestAnimationFrame(scrollStep);
      } else {
        edgeScrollRafRef.current = null;
      }
    };
    edgeScrollRafRef.current = requestAnimationFrame(scrollStep);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return; // Ignore touch gestures for desktop dock physics
    if (!scrollContainerRef.current) return;

    const rect = scrollContainerRef.current.getBoundingClientRect();
    const clientXRel = e.clientX - rect.left;
    const mouseX = clientXRel + scrollContainerRef.current.scrollLeft;
    mousePosRef.current = mouseX;
    updateTargets(mouseX);

    // Edge proximity auto-nudge/reveal (active within 180px of left/right edges)
    const edgeZone = 180;
    if (clientXRel < edgeZone && clientXRel >= 0) {
      const intensity = 1 - clientXRel / edgeZone; // 0 to 1
      edgeScrollSpeedRef.current = -Math.round(intensity * 12);
      startEdgeScroll();
    } else if (clientXRel > rect.width - edgeZone && clientXRel <= rect.width) {
      const intensity = 1 - (rect.width - clientXRel) / edgeZone; // 0 to 1
      edgeScrollSpeedRef.current = Math.round(intensity * 12);
      startEdgeScroll();
    } else {
      stopEdgeScroll();
    }
  };

  const handlePointerLeave = () => {
    mousePosRef.current = null;
    updateTargets(null);
    stopEdgeScroll();
  };

  // Keyboard accessibility focus handler
  const handleItemFocus = (index: number) => {
    const el = itemRefs.current[index];
    if (el) {
      const itemCenter = el.offsetLeft + el.offsetWidth / 2;
      updateTargets(itemCenter);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -380, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 380, behavior: 'smooth' });
    }
  };

  // Cleanup rAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (edgeScrollRafRef.current !== null) {
        cancelAnimationFrame(edgeScrollRafRef.current);
      }
    };
  }, []);

  return (
    <div className="relative w-full group/carousel py-2 overflow-hidden">
      {/* Left Edge Gradient Fade */}
      <div
        className="absolute left-0 top-0 bottom-0 w-24 sm:w-36 md:w-48 bg-gradient-to-r from-[#0A0B0E] via-[#0A0B0E]/80 to-transparent pointer-events-none z-30"
        aria-hidden="true"
      />

      {/* Right Edge Gradient Fade */}
      <div
        className="absolute right-0 top-0 bottom-0 w-24 sm:w-36 md:w-48 bg-gradient-to-l from-[#0A0B0E] via-[#0A0B0E]/80 to-transparent pointer-events-none z-30"
        aria-hidden="true"
      />

      {/* Edge Navigation Buttons - Centered Vertically & Revealed on Hover */}
      <button
        onClick={scrollLeft}
        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-[200] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-[#0071e3] text-white border-2 border-white/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 active:scale-90 opacity-0 pointer-events-none group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </button>

      <button
        onClick={scrollRight}
        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-[200] w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-black/80 hover:bg-[#0071e3] text-white border-2 border-white/40 flex items-center justify-center shadow-2xl backdrop-blur-md transition-all duration-300 active:scale-90 opacity-0 pointer-events-none group-hover/carousel:opacity-100 group-hover/carousel:pointer-events-auto"
        aria-label="Próximo"
      >
        <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
      </button>

      {/* Track Container: Reserved Vertical Padding (py-24) to ensure zero clipping */}
      <div
        ref={scrollContainerRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="w-full flex items-stretch gap-6 overflow-x-auto scrollbar-none px-12 sm:px-24 lg:px-36 py-24 snap-x snap-mandatory"
        style={{ scrollBehavior: 'smooth' }}
      >
        {products.map((product, idx) => {
          const isFeatured = product.featured;
          const IconComponent = ICON_MAP[product.iconName] || Play;

          return (
            <div
              key={product.id}
              ref={(el) => {
                itemRefs.current[idx] = el;
              }}
              onFocus={() => handleItemFocus(idx)}
              style={{
                transform: 'translate3d(0px, 0px, 0px) scale(1)',
                transformOrigin: 'center center',
                willChange: 'transform',
                zIndex: 1
              }}
              className="snap-start shrink-0 w-[300px] sm:w-[360px] md:w-[380px] flex flex-col justify-between rounded-3xl bg-[#1c1c1e] border border-[#2c2c2e] hover:border-[#3a3a3c] p-6 sm:p-8 cursor-pointer select-none group/card"
            >
              <div>
                {/* Badge Pill */}
                <div className="flex items-center justify-between mb-4">
                  <span
                    className={`px-3.5 py-1 rounded-full bg-[#2c2c2e] border border-white/10 text-xs font-semibold text-white/70 transition-colors duration-300 ${
                      product.isAvailable
                        ? 'group-hover/card:text-[#34C759]'
                        : 'group-hover/card:text-[#FFCC00]'
                    }`}
                  >
                    {product.badge}
                  </span>
                  {isFeatured && (
                    <span className="px-3 py-1 rounded-full bg-[#0071e3]/20 text-[#2997ff] border border-[#0071e3]/40 text-xs font-semibold">
                      Destaque
                    </span>
                  )}
                </div>

                {/* Thumbnail Frame */}
                <div
                  className={`relative w-full aspect-video rounded-2xl overflow-hidden bg-[#161617] border border-[#2c2c2e] mb-5 group-hover/card:scale-[1.03] transition-all duration-500 ease-quadratic flex items-center justify-center ${
                    product.isAvailable
                      ? 'grayscale-0'
                      : 'grayscale group-hover/card:grayscale-0'
                  }`}
                >
                  {/* Fallback icon — always underneath the slides */}
                  <div className="flex flex-col items-center justify-center text-center p-4">
                    <IconComponent className="w-10 h-10 text-[#2997ff] mb-2 opacity-90" />
                    <span className="text-xs font-medium text-white/70">
                      {product.name}
                    </span>
                  </div>
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

                {/* Product Name */}
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1 group-hover/card:text-[#2997ff] transition-colors leading-snug">
                  {product.name}
                </h3>

                {/* Subtitle */}
                <p className="text-sm text-[#2997ff] font-medium mb-3">
                  {product.subtitle}
                </p>

                {/* Description */}
                <p className="text-sm text-white/70 leading-relaxed mb-6">
                  {product.description}
                </p>

                {/* Feature Highlights */}
                <ul className="space-y-2.5 border-t border-[#2c2c2e] pt-4 mb-8">
                  {product.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5 text-xs sm:text-sm text-white/80">
                      <Check className="w-4 h-4 text-[#2997ff] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div>
                {product.isAvailable ? (
                  <a
                    href={product.url}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                    className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white text-sm font-semibold transition-all shadow-lg active:scale-95 text-center"
                  >
                    {product.ctaText}
                  </a>
                ) : (
                  <a
                    href={product.url}
                    onClick={(e) => {
                      e.stopPropagation();
                      onProductClick(product);
                    }}
                    className="w-full inline-flex items-center justify-center py-3.5 px-6 rounded-full bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white/70 border border-white/10 text-sm font-semibold transition-all text-center"
                  >
                    Em Breve • Lista de Espera
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
