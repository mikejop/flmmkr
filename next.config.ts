import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
      {
        source: '/assets/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
