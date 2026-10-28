import type { PluginOs } from '@/config/plugins';

const GA_PLUGINS_ID = 'G-1SVPG3X5SL';

type Gtag = (command: 'event', name: string, params: Record<string, string>) => void;

/**
 * Eventos de download para o Google Analytics da FLMMKR Plugins.
 * - plugin_download_click: clicou em qualquer botão de baixar (antes do cadastro).
 * - plugin_download: o download do .zip começou de fato.
 * O parâmetro `sistema` (macos, windows, linux ou nao_definido) alimenta a dimensão "Sistema do download".
 */
export function trackPluginEvent(name: 'plugin_download_click' | 'plugin_download', os: PluginOs | null) {
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  if (typeof gtag !== 'function') return;
  gtag('event', name, { send_to: GA_PLUGINS_ID, sistema: os ?? 'nao_definido' });
}
