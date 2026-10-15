import type { NextConfig } from 'next';
import { buildPublicCsp } from './src/utils/csp';

// A3: em build de produção na Vercel, faltar chave de segurança derruba o build (melhor que subir um checkout desprotegido).
function assertProductionSecurityEnv() {
  if (process.env.VERCEL_ENV !== 'production') return;
  const required = [
    'TURNSTILE_SECRET_KEY',
    'NEXT_PUBLIC_TURNSTILE_SITE_KEY',
    'UPSTASH_REDIS_REST_URL',
    'UPSTASH_REDIS_REST_TOKEN',
    'RATE_LIMIT_HMAC_SECRET',
  ];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length) {
    throw new Error(
      `Build de produção bloqueado: faltam variáveis de ambiente de segurança: ${missing.join(', ')}. ` +
        'Cadastre-as na Vercel (Settings > Environment Variables > Production) e rode o deploy de novo.'
    );
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gnqqaskurjkrllnhjygt.supabase.co';
const supabaseHostname = new URL(supabaseUrl).hostname;

// Versão do sistema: muda a cada deploy e invalida os caches de 7 dias no navegador do aluno.
const appVersion =
  process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
  process.env.NEXT_PUBLIC_APP_VERSION ||
  'local';

const SEVEN_DAYS = 60 * 60 * 24 * 7;

const nextConfig: NextConfig = {
  // Não anuncia a tecnologia do servidor no cabeçalho X-Powered-By.
  poweredByHeader: false,
  experimental: {
    // Hash (SRI) nos scripts do Next: permite CSP sem nonce e sem 'unsafe-inline' nas páginas estáticas.
    sri: { algorithm: 'sha256' },
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: appVersion,
  },
  images: {
    // SVG remoto pode carregar script: o otimizador de imagens nunca serve SVG.
    dangerouslyAllowSVG: false,
    // Só o Storage público do nosso projeto Supabase (hostname exato, sem curinga).
    remotePatterns: [
      {
        protocol: 'https',
        hostname: supabaseHostname,
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/color-master',
        destination: '/produtos/color-master',
        permanent: false,
      },
      {
        source: '/direcao-de-fotografia',
        destination: '/produtos/direcao-de-fotografia',
        permanent: false,
      },
      {
        source: '/color-grading-youtubers',
        destination: '/produtos/color-grading-youtubers',
        permanent: false,
      },
      {
        source: '/color-grading-publicidade',
        destination: '/produtos/color-grading-publicidade',
        permanent: false,
      },
      {
        source: '/producao-de-video-para-empreendedores',
        destination: '/produtos/producao-de-video-para-empreendedores',
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      ...(process.env.NODE_ENV === 'production'
        ? [{
            // Páginas públicas (estáticas): CSP sem nonce. A área de membros e o login usam a CSP com nonce do proxy.
            source: '/((?!(?:color-master-produto|conteudo|login|primeiro-acesso|definir-senha|api)(?:/|$)).*)',
            headers: [
              { key: 'Content-Security-Policy', value: buildPublicCsp() },
              { key: 'Content-Security-Policy-Report-Only', value: buildPublicCsp({ strictStyles: true }) },
            ],
          }]
        : []),
      {
        // O proxy de cache nunca pode ficar preso: o navegador revalida o sw.js a cada visita.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        // Fontes e imagens estáticas ficam 7 dias no navegador; depois revalidam sem bloquear.
        source: '/:dir(fonts|images)/:path*',
        headers: [
          { key: 'Cache-Control', value: `public, max-age=${SEVEN_DAYS}, stale-while-revalidate=86400` },
        ],
      },
    ];
  },
};

export default (phase: string): NextConfig => {
  if (phase === 'phase-production-build') assertProductionSecurityEnv();
  return nextConfig;
};
