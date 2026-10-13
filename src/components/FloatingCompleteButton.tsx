'use client';

import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { CheckCircle2 } from 'lucide-react';

gsap.registerPlugin(useGSAP);

const SMALL = 28;  // repouso: metade do tamanho
const FULL = 56;   // hover/foco: tamanho cheio
const ICON = 26;
const ICON_SMALL_SCALE = 14 / ICON;

interface FloatingCompleteButtonProps {
  onComplete: () => void;
  className?: string;
}

/**
 * Botão flutuante em duas etapas (timeline do GSAP):
 *  entrar: 1) cresce como um círculo  →  2) o círculo vira o botão com o texto "Concluir Aula"
 *  sair:   a mesma timeline ao contrário (o botão volta a círculo  →  encolhe)
 */
export default function FloatingCompleteButton({ onComplete, className = '' }: FloatingCompleteButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const iconBoxRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    const btn = btnRef.current;
    const label = labelRef.current;
    const box = iconBoxRef.current;
    const icon = iconRef.current;
    if (!btn || !label || !box || !icon) return;

    gsap.set(label, { x: 12, opacity: 0 });
    gsap.set(icon, { scale: ICON_SMALL_SCALE });

    const expandedWidth = FULL + label.scrollWidth + 8;
    tlRef.current = gsap
      .timeline({ paused: true })
      // etapa 1: cresce como círculo (largura = altura)
      .to(btn, { width: FULL, height: FULL, duration: 0.16, ease: 'power3.out' }, 0)
      .to(box, { width: FULL, height: FULL, duration: 0.16, ease: 'power3.out' }, 0)
      .to(icon, { scale: 1, duration: 0.16, ease: 'power3.out' }, 0)
      // etapa 2: o círculo se transforma no botão de texto (alarga e o texto aparece)
      .to(btn, { width: expandedWidth, duration: 0.1, ease: 'power3.inOut' }, 0.16)
      .to(label, { opacity: 1, x: 0, duration: 0.1, ease: 'power2.out' }, 0.2);
  }, { scope: btnRef });

  const open = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tl.progress(1);
    else tl.play();
  };
  const close = () => {
    const tl = tlRef.current;
    if (!tl) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) tl.progress(0);
    else tl.reverse();
  };

  return (
    <button
      ref={btnRef}
      type="button"
      onClick={onComplete}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
      aria-label="Concluir Aula"
      style={{ width: SMALL, height: SMALL }}
      className={`rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white shadow-lg flex items-center justify-end overflow-hidden cursor-pointer transition-colors duration-150 active:scale-[0.97] ${className}`}
    >
      <span
        ref={labelRef}
        aria-hidden="true"
        className="whitespace-nowrap pl-6 text-sm font-semibold"
      >
        Concluir Aula
      </span>
      <span ref={iconBoxRef} style={{ width: SMALL, height: SMALL }} className="shrink-0 flex items-center justify-center">
        <CheckCircle2 ref={iconRef} size={ICON} aria-hidden="true" />
      </span>
    </button>
  );
}
