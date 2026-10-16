'use client';

import { useSyncExternalStore } from 'react';

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

/**
 * Celular: menos de 768 px. Tablet: de 768 a 1279 px, ou tela de toque até 1400 px (iPad Pro na horizontal).
 * Resto: desktop. Qualquer tablet entra, não importa o modelo.
 */
const TABLET_QUERY = '(min-width: 768px) and (max-width: 1279px), (min-width: 768px) and (max-width: 1400px) and (pointer: coarse)';
const MOBILE_QUERY = '(max-width: 767px)';

function subscribe(onChange: () => void) {
  const queries = [window.matchMedia(TABLET_QUERY), window.matchMedia(MOBILE_QUERY)];
  queries.forEach((q) => q.addEventListener('change', onChange));
  return () => queries.forEach((q) => q.removeEventListener('change', onChange));
}

function getSnapshot(): ViewportMode {
  if (window.matchMedia(MOBILE_QUERY).matches) return 'mobile';
  if (window.matchMedia(TABLET_QUERY).matches) return 'tablet';
  return 'desktop';
}

/** No servidor (e na hidratação) assume desktop; no navegador corrige na hora, sem aviso de hidratação. */
export function useViewportMode(): ViewportMode {
  return useSyncExternalStore(subscribe, getSnapshot, () => 'desktop' as ViewportMode);
}
