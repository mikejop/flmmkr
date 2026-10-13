'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { smoothScrollTo } from '@/lib/smoothScroll';

interface BackToTopButtonProps {
  containerRef: React.RefObject<HTMLElement | null>;
  /** Distância rolada (px) a partir da qual o botão aparece. */
  threshold?: number;
}

/** Botão flutuante que leva ao topo do conteúdo da aula (rolagem animada). */
export default function BackToTopButton({ containerRef, threshold = 600 }: BackToTopButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setVisible(el.scrollTop > threshold);
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [containerRef, threshold]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => {
        const el = containerRef.current;
        if (el) smoothScrollTo(el, 0);
      }}
      aria-label="Voltar ao topo da página"
      title="Voltar ao topo"
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0071e3] text-white shadow-lg shadow-black/25 transition-colors hover:bg-[#0077ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0071e3] cursor-pointer"
    >
      <ArrowUp size={20} aria-hidden="true" />
    </button>
  );
}
