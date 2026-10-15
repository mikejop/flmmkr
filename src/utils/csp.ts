const GOOGLE_TAGS = 'https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://www.google.com https://www.google.com.br https://stats.g.doubleclick.net';
const CLARITY = 'https://www.clarity.ms https://*.clarity.ms https://c.bing.com';
const PANDA = 'https://*.pandavideo.com.br https://player.pandavideo.com.br https://cdn.pandavideo.com https://api-v2.pandavideo.com.br https://*.b-cdn.net';
const ASAAS = 'https://*.asaas.com';
const TURNSTILE = 'https://challenges.cloudflare.com';
const YOUTUBE = 'https://www.youtube-nocookie.com https://www.youtube.com';

export const CSP_REPORT_PATH = '/api/security/csp-report';

function supabaseHost(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnqqaskurjkrllnhjygt.supabase.co').host;
  } catch {
    return 'gnqqaskurjkrllnhjygt.supabase.co';
  }
}

/**
 * Política de CSP por requisição (nonce novo a cada pedido).
 * `strictStyles: true` remove 'unsafe-inline' de estilos: usado só na política paralela Report-Only,
 * para mapear o que ainda depende de style inline antes de endurecer.
 */
export function buildCsp(nonce: string, opts: { strictStyles?: boolean } = {}): string {
  const supa = supabaseHost();
  const devEval = process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : '';
  const devWs = process.env.NODE_ENV === 'development' ? ' ws://localhost:* http://localhost:*' : '';
  const styleSrc = opts.strictStyles
    ? "style-src 'self' https://fonts.googleapis.com"
    : "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com";
  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'self'",
    `form-action 'self' ${ASAAS}`,
    `img-src 'self' data: blob: https://${supa} ${PANDA} ${GOOGLE_TAGS} ${CLARITY} https://img.youtube.com https://images.unsplash.com https://plus.unsplash.com`,
    `media-src 'self' data: blob: https://${supa} ${PANDA}`,
    "font-src 'self' data: https://fonts.gstatic.com",
    styleSrc,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${devEval} ${PANDA} ${ASAAS} ${TURNSTILE} ${GOOGLE_TAGS} ${CLARITY}`,
    `connect-src 'self' https://${supa} wss://${supa} ${PANDA} ${ASAAS} ${TURNSTILE} ${GOOGLE_TAGS} ${CLARITY}${devWs}`,
    `frame-src 'self' ${PANDA} ${ASAAS} ${TURNSTILE} ${YOUTUBE} https://www.googletagmanager.com`,
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
    `report-uri ${CSP_REPORT_PATH}`,
  ].join('; ');
}
