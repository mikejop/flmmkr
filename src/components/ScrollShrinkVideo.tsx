'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

export interface ScrollShrinkVideoHandle {
  /** Leva a aula até o fim da "pista" de rolagem: o vídeo diminui sozinho (ex.: ao acabar o último vídeo). */
  reveal: () => void;
}

interface ScrollShrinkVideoProps {
  /** Quadro de conteúdo que rola (o mesmo `lessonContainerRef` da aula). */
  containerRef: React.RefObject<HTMLElement | null>;
  /** Muda quando a aula troca: o vídeo volta a ocupar o quadro inteiro. */
  resetKey?: string;
  /** Avisa quando o título/conteúdo passam a aparecer (progresso ≥ 45%) ou voltam a sumir (modo cinema). */
  onRevealChange?: (revealed: boolean) => void;
  children: React.ReactNode;
}

const HERO_BG = '#000000';
const PAGE_BG = '#f5f5f7';

/**
 * Vídeo que acompanha a rolagem (scrub):
 *  - scrollTop = 0           → o vídeo ocupa o quadro de conteúdo inteiro e nada mais aparece;
 *  - scrollTop de 0 até D    → o vídeo diminui até o tamanho/posição normais, o fundo clareia e o
 *                              título e o resto do conteúdo surgem, tudo proporcional à rolagem;
 *  - scrollTop acima de D    → a página rola normalmente.
 *
 * Durante os primeiros D px o conteúdo fica "congelado" no lugar (o #lesson-zoom-target é `sticky`
 * com uma pista de D px de altura logo depois dele; veja MemberAreaApp). Não há gatilho nem
 * animação temporizada: o progresso vem sempre da posição da rolagem, suavizado com gsap.quickTo.
 */
const ScrollShrinkVideo = forwardRef<ScrollShrinkVideoHandle, ScrollShrinkVideoProps>(function ScrollShrinkVideo(
  { containerRef, resetKey, onRevealChange, children },
  ref
) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const runwayRef = useRef(0); // D: distância de rolagem do efeito, em px
  const revealTweenRef = useRef<gsap.core.Tween | null>(null);
  const [retry, setRetry] = useState(0);
  const onRevealChangeRef = useRef(onRevealChange);
  useEffect(() => { onRevealChangeRef.current = onRevealChange; }, [onRevealChange]);

  useImperativeHandle(ref, () => ({
    reveal: () => {
      const container = containerRef.current;
      const D = runwayRef.current;
      if (!container || !D) return;
      revealTweenRef.current?.kill();
      const proxy = { y: container.scrollTop };
      revealTweenRef.current = gsap.to(proxy, {
        y: D,
        duration: 0.9,
        ease: 'power3.inOut',
        onUpdate: () => { container.scrollTop = proxy.y; },
      });
    },
  }), [containerRef]);

  useGSAP(() => {
    const container = containerRef.current;
    const wrap = wrapRef.current;
    const slot = wrap?.parentElement; // espaço do vídeo no fluxo (não sofre o transform do vídeo)
    if (!container || !wrap || !slot) {
      // Na primeira montagem o efeito deste filho roda ANTES de o React ligar o ref do quadro (pai): container ainda é null.
      // Tenta de novo no próximo quadro; sem isto o efeito do vídeo "cheio" nunca era armado na primeira aula aberta.
      const id = requestAnimationFrame(() => setRetry((n) => n + 1));
      return () => cancelAnimationFrame(id);
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      container.style.setProperty('--hero-runway', '0px');
      runwayRef.current = 0;
      onRevealChangeRef.current?.(true);
      return; // sem animação: o vídeo fica no lugar normal
    }

    const zoomTarget = container.querySelector<HTMLElement>('#lesson-zoom-target');
    const host = container.parentElement; // <main>: a barra fixa do título lê --hero-fade daqui
    const state = { p: 0 }; // progresso suavizado (0 = vídeo ocupa o quadro · 1 = layout normal)
    let D = 0;

    const clearAll = () => {
      container.removeAttribute('data-hero');
      gsap.set(wrap, { clearProps: 'transform,zIndex,transformOrigin' });
      gsap.set(container, { clearProps: 'backgroundColor,--hero-fade' });
      if (host) gsap.set(host, { clearProps: '--hero-fade' });
    };

    let lastRevealed: boolean | null = null;
    const notify = (revealed: boolean) => {
      if (revealed === lastRevealed) return;
      lastRevealed = revealed;
      onRevealChangeRef.current?.(revealed);
    };

    const render = () => {
      const p = state.p;
      notify(p >= 0.45);
      if (p >= 0.999) { clearAll(); return; }
      container.setAttribute('data-hero', '1');

      const s = slot.getBoundingClientRect();
      const c = container.getBoundingClientRect();
      if (!s.width || !s.height) return;

      const W = container.clientWidth;
      const H = container.clientHeight;
      const zoom = parseFloat(zoomTarget ? getComputedStyle(zoomTarget).getPropertyValue('--lesson-zoom-scale') : '') || 1;
      const fit = Math.max(1, Math.min(W / s.width, H / s.height));
      const tx = (c.left + (W - s.width * fit) / 2 - s.left) / zoom;
      const ty = (c.top + (H - s.height * fit) / 2 - s.top) / zoom;

      gsap.set(wrap, {
        transformOrigin: '0 0',
        x: tx * (1 - p),
        y: ty * (1 - p),
        scale: 1 + (fit - 1) * (1 - p),
        zIndex: 20,
      });
      const fade = gsap.utils.clamp(0, 1, (p - 0.45) / 0.55);
      gsap.set(container, {
        backgroundColor: gsap.utils.interpolate(HERO_BG, PAGE_BG, p),
        '--hero-fade': fade,
      });
      if (host) gsap.set(host, { '--hero-fade': fade });
    };

    const measure = () => {
      D = Math.round(gsap.utils.clamp(320, 720, container.clientHeight * 0.6));
      runwayRef.current = D;
      container.style.setProperty('--hero-runway', `${D}px`);
    };

    const setProgress = gsap.quickTo(state, 'p', { duration: 0.3, ease: 'power3.out', onUpdate: render });
    const onScroll = () => setProgress(gsap.utils.clamp(0, 1, container.scrollTop / D));
    const stopReveal = () => revealTweenRef.current?.kill();

    // Estado inicial de cada aula: topo da página, vídeo ocupando o quadro.
    measure();
    container.scrollTop = 0;
    state.p = 0;
    render();

    container.addEventListener('scroll', onScroll, { passive: true });
    container.addEventListener('wheel', stopReveal, { passive: true });
    container.addEventListener('touchstart', stopReveal, { passive: true });
    const ro = new ResizeObserver(() => { measure(); onScroll(); render(); });
    ro.observe(container);
    // O espaço do vídeo muda de altura quando o player termina de carregar (a busca dos vídeos é assíncrona).
    // Sem isto, o tamanho "cheio" calculado no primeiro desenho ficava desatualizado até a próxima rolagem.
    ro.observe(slot);

    return () => {
      ro.disconnect();
      container.removeEventListener('scroll', onScroll);
      container.removeEventListener('wheel', stopReveal);
      container.removeEventListener('touchstart', stopReveal);
      revealTweenRef.current?.kill();
      clearAll();
      container.style.setProperty('--hero-runway', '0px');
      runwayRef.current = 0;
    };
  }, { dependencies: [resetKey, retry], revertOnUpdate: true });

  return (
    <div className="w-full">
      {/* Sem will-change/transform em repouso: eles virariam o "bloco de referência" do mini player (position: fixed) */}
      <div ref={wrapRef} className="relative">
        {children}
      </div>
    </div>
  );
});

export default ScrollShrinkVideo;
