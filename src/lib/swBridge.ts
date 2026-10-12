import { APP_VERSION } from '@/lib/appVersion';

/** Registra o proxy de cache (service worker). Só em produção, para não atrapalhar o `next dev`. */
export function registerCacheProxy(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (process.env.NODE_ENV !== 'production') return;
  const register = () => {
    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(APP_VERSION)}`, { scope: '/', updateViaCache: 'none' })
      .catch(() => {});
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

/** Apaga os arquivos privados guardados no computador (chamar no logout). */
export function purgePrivateCache(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  try {
    navigator.serviceWorker.controller?.postMessage({ type: 'PURGE_PRIVATE' });
  } catch {
    /* noop */
  }
  if ('caches' in window) {
    caches.keys().then((names) => names.filter((n) => n.startsWith('flmmkr-private-')).forEach((n) => caches.delete(n))).catch(() => {});
  }
}
