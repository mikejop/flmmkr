import type { Metadata } from 'next';
import Script from 'next/script';
import Prisma2Download from '@/components/prisma2/Prisma2Download';
import { CONTENT } from '@/components/prisma2/content';
import { FEATURES } from '@/components/prisma2/features';
import { SITE_CONFIG } from '@/config/siteConfig';

const PAGE_URL = `${SITE_CONFIG.seo.url}/prisma2/download`;
const OG_IMAGE = '/prisma2/og-prisma2.png';
const TITLE = 'PRISMA 2: gravador de tela para Mac, leve e feito para quem ensina | FLMMKR';
const DESCRIPTION =
  'PRISMA 2 é um gravador de tela leve para macOS: grava tela até 120 fps, áudio do sistema, microfone e câmera, com ferramentas de desenho, lupa e teclas na tela, e usa o celular como câmera e controle remoto. Baixe o open beta.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  applicationName: 'PRISMA 2',
  keywords: [
    'PRISMA 2', 'gravador de tela para Mac', 'gravar tela Mac', 'screen capture macOS', 'screen recorder Mac',
    'gravação de tela para professores', 'gravar aula no Mac', 'gravar tela com câmera e microfone', 'gravar áudio do sistema Mac',
    'celular como câmera e controle remoto', 'FLMMKR', 'software de gravação de tela leve', 'download PRISMA 2',
  ],
  authors: [{ name: 'FLMMKR', url: SITE_CONFIG.seo.url }],
  creator: 'FLMMKR',
  publisher: 'FLMMKR',
  category: 'Software',
  alternates: { canonical: PAGE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: 'FLMMKR',
    title: 'PRISMA 2 | Screen Capture for MacOS',
    description: DESCRIPTION,
    locale: 'pt_BR',
    alternateLocale: ['en_US', 'es_ES', 'it_IT', 'fr_FR', 'ar_AR', 'zh_CN'],
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: 'PRISMA 2, Screen Capture for MacOS' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PRISMA 2 | Screen Capture for MacOS',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
  // Favicon desta página: o ícone do app PRISMA 2
  icons: {
    icon: [
      { url: '/prisma2/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/prisma2/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/prisma2/favicon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/prisma2/favicon-32.png',
    apple: [{ url: '/prisma2/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

const pt = CONTENT['pt-BR'];
const ptFeatures = FEATURES['pt-BR'];

// Dados estruturados (SEO, AEO e GEO): programa, perguntas e respostas e caminho de navegação. Só o que o app faz de fato.
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      '@id': `${PAGE_URL}#software`,
      name: 'PRISMA 2',
      alternateName: 'PRISMA 2 - Screen Capture for MacOS',
      description: DESCRIPTION,
      url: PAGE_URL,
      image: `${SITE_CONFIG.seo.url}${OG_IMAGE}`,
      applicationCategory: 'MultimediaApplication',
      applicationSubCategory: 'Screen recorder',
      operatingSystem: 'macOS 15 ou superior',
      softwareVersion: '2.0.0',
      releaseNotes: 'Open beta',
      fileSize: '25 MB',
      downloadUrl: PAGE_URL,
      inLanguage: ['pt-BR', 'en', 'es', 'it', 'fr', 'ar', 'zh'],
      featureList: ptFeatures.groups.flatMap((g) => g.items.map((item) => `${g.title}: ${item}`)),
      author: { '@type': 'Organization', name: 'FLMMKR', url: SITE_CONFIG.seo.url },
      publisher: { '@type': 'Organization', name: 'FLMMKR', url: SITE_CONFIG.seo.url },
    },
    {
      '@type': 'FAQPage',
      '@id': `${PAGE_URL}#faq`,
      inLanguage: 'pt-BR',
      mainEntity: pt.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'FLMMKR', item: SITE_CONFIG.seo.url },
        { '@type': 'ListItem', position: 2, name: 'PRISMA 2', item: PAGE_URL },
      ],
    },
  ],
};

export default function Prisma2DownloadPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD).replace(/</g, '\\u003c') }} />
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
