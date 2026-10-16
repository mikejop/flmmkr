'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/** Preço que "desce" (ou sobe) rápido até o valor alvo, como uma contagem. Sem animação se o sistema pedir menos movimento. */
export function useAnimatedPrice(target: number, duration = 0.85): number {
  const [shown, setShown] = useState<number>(target);
  const shownRef = useRef<number>(target);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || shownRef.current === target) {
      shownRef.current = target;
      setShown(target);
      return;
    }
    const counter = { v: shownRef.current };
    const tween = gsap.to(counter, {
      v: target,
      duration,
      ease: 'power2.out',
      onUpdate: () => {
        const v = Math.round(counter.v * 100) / 100;
        shownRef.current = v;
        setShown(v);
      },
      onComplete: () => { shownRef.current = target; setShown(target); },
    });
    return () => { tween.kill(); };
  }, [target, duration]);

  return shown;
}

/** "67" (inteiro) ou "67,90" (centavos). Durante a contagem sempre mostra os centavos. */
export function formatPriceBR(value: number, final: number): string {
  if (value === final) return Number.isInteger(final) ? String(final) : final.toFixed(2).replace('.', ',');
  return value.toFixed(2).replace('.', ',');
}
