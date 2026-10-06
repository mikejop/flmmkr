import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import { SITE_CONFIG } from '@/config/siteConfig';
import { PRODUCTS } from '@/config/products';
import { GENERAL_FAQ } from '@/config/faq';
import { TrafficTelemetryTracker } from '@/components/TrafficTelemetryTracker';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.seo.url),
  title: {
    default: `${SITE_CONFIG.name} | Treinamentos Audiovisual`,
    template: `%s | ${SITE_CONFIG.name}`,
  },
  description: SITE_CONFIG.seo.description,
  applicationName: SITE_CONFIG.name,
  authors: [{ name: SITE_CONFIG.author.name, url: SITE_CONFIG.seo.url }],
  generator: 'Next.js',
  keywords: [
    'FLMMKR',
    'Michael Oliveira',
    'Color Master',
    'Color Master Produto',
    'Color Grading DaVinci Resolve',
    'Direção de Fotografia',
    'Treinamentos Audiovisual',
    'Color Grading Publicitário',
    'Color Grading de Produto',
    'Curso DaVinci Resolve',
    'Filmmaking Profissional',
    'Vídeo para Empreendedores'
  ],
  referrer: 'origin-when-cross-origin',
  creator: SITE_CONFIG.author.name,
  publisher: SITE_CONFIG.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
    languages: {
      'pt-BR': '/',
    },
  },
  openGraph: {
    title: `${SITE_CONFIG.name} | Treinamentos Audiovisual`,
    description: SITE_CONFIG.seo.description,
    url: SITE_CONFIG.seo.url,
    siteName: SITE_CONFIG.name,
    locale: SITE_CONFIG.seo.locale,
    type: 'website',
    images: [
      {
        url: SITE_CONFIG.seo.ogImage,
        width: 1200,
        height: 630,
        alt: `${SITE_CONFIG.name} - Treinamentos Audiovisual`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_CONFIG.name} | Treinamentos Audiovisual`,
    description: SITE_CONFIG.seo.description,
    images: [SITE_CONFIG.seo.ogImage],
    creator: '@michaeloliveira',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'bingbot': 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || 'BING_VERIFICATION_PLACEHOLDER',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // JSON-LD Structured Data for AEO / GEO / Search Engines
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.seo.url,
    description: SITE_CONFIG.seo.description,
    author: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
      jobTitle: SITE_CONFIG.author.role,
    },
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.seo.url,
    description: SITE_CONFIG.seo.description,
    founder: {
      '@type': 'Person',
      name: SITE_CONFIG.author.name,
    },
    sameAs: SITE_CONFIG.social.map((s) => s.url),
  };

  const courseListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: PRODUCTS.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'Course',
        name: product.name,
        description: product.description,
        provider: {
          '@type': 'Person',
          name: SITE_CONFIG.author.name,
        },
        offers: {
          '@type': 'Offer',
          category: product.isAvailable ? 'Available' : 'Waitlist',
          availability: product.isAvailable
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        },
      },
    })),
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: GENERAL_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <html lang="pt-BR" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* Google Analytics (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-RD157QZHM5"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-RD157QZHM5');
          `}
        </Script>
      </head>
      <body className="min-h-full bg-[#f5f5f7] text-[#1d1d1f] font-sans selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
        <Suspense fallback={null}>
          <TrafficTelemetryTracker />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
