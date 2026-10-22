import type { Metadata } from 'next';
import Script from 'next/script';
import Prisma2Download from '@/components/prisma2/Prisma2Download';

// Página oculta: fora dos buscadores, do sitemap e de qualquer link das landing pages e da área de membros.
export const metadata: Metadata = {
  title: { absolute: 'PRISMA 2 - Screen Capture for MacOS | FLMMKR' },
  description: 'Baixe o PRISMA 2, Screen Capture for MacOS, e veja como instalar no Mac.',
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: '/prisma2/download' },
  // Favicon desta página: o ícone do app PRISMA 2
  icons: {
    icon: [
      { url: '/prisma2/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/prisma2/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/prisma2/favicon-32.png',
    apple: [{ url: '/prisma2/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function Prisma2DownloadPage() {
  return (
    <>
      {/* Google Analytics desta página: adiciona a configuração ao gtag.js que o layout já carrega (mesmo padrão da página do produto) */}
      <Script id="ga-prisma2" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('config', 'G-8G14SMDYXM');
        `}
      </Script>
      <Prisma2Download />
    </>
  );
}
