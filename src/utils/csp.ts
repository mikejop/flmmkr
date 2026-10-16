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

/** Rotas dinâmicas (área de membros, login e fluxo de senha): usam CSP com nonce por requisição, definida no proxy. */
export const NONCE_ROUTE_PREFIXES = ['/color-master-produto', '/conteudo', '/login', '/primeiro-acesso', '/definir-senha'];

export function usesNonceCsp(pathname: string): boolean {
  return NONCE_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

type CspMode = { nonce: string } | { nonce?: undefined };

function build(mode: CspMode, opts: { strictStyles?: boolean } = {}): string {
  const supa = supabaseHost();
  const isDev = process.env.NODE_ENV === 'development';
  const devEval = isDev ? " 'unsafe-eval'" : '';
  const devWs = isDev ? ' ws://localhost:* http://localhost:*' : '';
  const styleSrc = opts.strictStyles
    ? "style-src 'self' https://fonts.googleapis.com"
    : "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com";
  // Com nonce: scripts confiáveis carregam os dependentes (strict-dynamic).
  // Sem nonce (páginas públicas estáticas): 'self', os domínios listados e 'unsafe-inline'. O 'unsafe-inline' é inevitável
  // hoje porque o Next injeta scripts inline com os dados da página (self.__next_f.push) que mudam por rota e não têm nonce
  // nem hash em página estática; sem ele a hidratação quebra (testado). Os chunks externos ganham integrity por SRI.
  // Essas páginas não renderizam conteúdo de usuário; comentários e perfil ficam na área de membros, com nonce.
  const scriptSrc = mode.nonce
    ? `script-src 'self' 'nonce-${mode.nonce}' 'strict-dynamic'${devEval} ${PANDA} ${ASAAS} ${TURNSTILE} ${GOOGLE_TAGS} ${CLARITY}`
    : `script-src 'self' 'unsafe-inline'${devEval} ${PANDA} ${ASAAS} ${TURNSTILE} ${GOOGLE_TAGS} ${CLARITY}`;
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
    scriptSrc,
    `connect-src 'self' https://${supa} wss://${supa} ${PANDA} ${ASAAS} ${TURNSTILE} ${GOOGLE_TAGS} ${CLARITY}${devWs}`,
    `frame-src 'self' ${PANDA} ${ASAAS} ${TURNSTILE} ${YOUTUBE} https://www.googletagmanager.com`,
    "worker-src 'self' blob:",
    'upgrade-insecure-requests',
    `report-uri ${CSP_REPORT_PATH}`,
  ].join('; ');
}

/** CSP com nonce (área de membros e autenticação). `strictStyles` só para a política paralela Report-Only. */
export function buildCsp(nonce: string, opts: { strictStyles?: boolean } = {}): string {
  return build({ nonce }, opts);
}

/** CSP sem nonce e sem 'unsafe-inline' em scripts, para as páginas públicas estáticas (cabeçalho do next.config). */
export function buildPublicCsp(opts: { strictStyles?: boolean } = {}): string {
  return build({}, opts);
}
