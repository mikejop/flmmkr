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
};

export default nextConfig;
