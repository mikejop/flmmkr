'use client';

import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(useGSAP);

/** Curvas: aceleração e desaceleração suaves, no mesmo "peso" em todo o menu. */
export const SIDEBAR_EASE = 'power3.inOut';
export const SIDEBAR_WIDTH_OPEN = 288;
export const SIDEBAR_WIDTH_CLOSED = 64;

/**
 * Anima a largura do menu lateral e o aparecer/sumir dos textos.
 * `expanded` é o destino; `labelsShown` é o que está desenhado (textos continuam visíveis enquanto o menu fecha).
 * No celular (gaveta) a largura muda sem animar; só os textos entram com fade.
 */
export function useSidebarMotion(asideRef: React.RefObject<HTMLElement | null>, expanded: boolean) {
  const [labelsShown, setLabelsShown] = useState(expanded);
  const first = useRef(true);
  const [prevExpanded, setPrevExpanded] = useState(expanded);

  // Ao abrir, desenha os textos já (o fade de entrada roda na hora); ao fechar, só depois da animação.
  if (expanded !== prevExpanded) {
    setPrevExpanded(expanded);
    if (expanded) setLabelsShown(true);
  }

  useGSAP((_, contextSafe) => {
    const el = asideRef.current;
    if (!el || !contextSafe) return;
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const target = expanded ? Math.min(SIDEBAR_WIDTH_OPEN, window.innerWidth * 0.85) : SIDEBAR_WIDTH_CLOSED;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (first.current) {
      first.current = false;
      gsap.set(el, { width: target });
      return;
    }
    if (!desktop || reduce) {
      gsap.set(el, { width: target });
      if (!expanded) setLabelsShown(false);
      return;
    }

    const done = contextSafe(() => setLabelsShown(false));
    if (expanded) {
      gsap.to(el, { width: target, duration: 0.5, ease: SIDEBAR_EASE, overwrite: 'auto' });
      // Os textos entram quando o menu já abriu um pouco, em cascata curta.
      gsap.fromTo(
        el.querySelectorAll('.sb-fade'),
        { opacity: 0, x: -10 },
        { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out', stagger: 0.025, delay: 0.14, overwrite: 'auto', clearProps: 'opacity,transform' }
      );
    } else {
      gsap.to(el.querySelectorAll('.sb-fade'), { opacity: 0, x: -6, duration: 0.16, ease: 'power2.in', stagger: 0.01, overwrite: 'auto' });
      gsap.to(el, { width: target, duration: 0.45, ease: SIDEBAR_EASE, delay: 0.06, overwrite: 'auto', onComplete: done });
    }
  }, { dependencies: [expanded], scope: asideRef });

  return labelsShown;
}

/** Abre e fecha uma lista com altura animada (GSAP). Só monta o conteúdo enquanto aberto ou animando o fechamento. */
export function GsapCollapse({ open, className, children }: { open: boolean; className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const first = useRef(true);
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  useGSAP((_, contextSafe) => {
    const el = ref.current;
    if (!el || !contextSafe) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFirst = first.current;
    first.current = false;

    if (open) {
      if (isFirst || reduce) return;
      gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.42, ease: 'power3.out', overwrite: 'auto', clearProps: 'height,opacity' });
      gsap.from(el.children, { opacity: 0, x: -8, duration: 0.32, ease: 'power2.out', stagger: 0.045, delay: 0.06, clearProps: 'opacity,transform' });
    } else {
      const unmount = contextSafe(() => setMounted(false));
      if (reduce) { unmount(); return; }
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power3.in', overwrite: 'auto', onComplete: unmount });
    }
  }, { dependencies: [open] });

  if (!mounted) return null;
  return <div ref={ref} className={className}>{children}</div>;
}

/** Seta que gira 90° com aceleração e desaceleração. */
export function GsapChevron({ open, children, className }: { open: boolean; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const first = useRef(true);
  useGSAP(() => {
    if (!ref.current) return;
    if (first.current) {
      first.current = false;
      gsap.set(ref.current, { rotation: open ? 90 : 0 });
      return;
    }
    gsap.to(ref.current, { rotation: open ? 90 : 0, duration: 0.32, ease: SIDEBAR_EASE, overwrite: 'auto' });
  }, { dependencies: [open] });
  return <span ref={ref} className={className} style={{ display: 'inline-flex' }}>{children}</span>;
}
