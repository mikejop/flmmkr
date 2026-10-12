/**
 * Versão do sistema. É definida no build (next.config.ts) a partir do commit da Vercel.
 * Mudou a versão => caches do navegador (localStorage e service worker) são invalidados.
 */
export const APP_VERSION: string = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
