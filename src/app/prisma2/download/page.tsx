import type { Metadata } from 'next';
import Prisma2Download from '@/components/prisma2/Prisma2Download';

// Página oculta: fora dos buscadores, do sitemap e de qualquer link das landing pages e da área de membros.
export const metadata: Metadata = {
  title: { absolute: 'PRISMA 2 - Screen Capture for MacOS | FLMMKR' },
  description: 'Baixe o PRISMA 2, Screen Capture for MacOS, e veja como instalar no Mac.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/prisma2/download' },
};

export default function Prisma2DownloadPage() {
  return <Prisma2Download />;
}
