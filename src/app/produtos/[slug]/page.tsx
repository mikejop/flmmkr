import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';
import { ColorMasterLanding } from '@/components/ColorMasterLanding';
import {
  CheckCircle2,
  ArrowRight,
  Film,
  ChevronLeft,
  Award
} from 'lucide-react';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) return {};

  const baseUrl = SITE_CONFIG.seo.url;
  const canonicalUrl = `${baseUrl}/produtos/${product.slug}`;
  const isColorMaster = product.slug === 'color-master-produto' || product.slug === 'color-master';

  const title = isColorMaster
    ? 'Color Master® Produto | Curso de Color Grading no DaVinci Resolve'
    : `${product.name} | ${SITE_CONFIG.name}`;

  const description = isColorMaster
    ? 'Masterclass de Color Grading para vídeos de produto e comerciais no DaVinci Resolve. Aprenda o workflow profissional sem simulacros com Michael Oliveira.'
    : product.description;

  const ogImage = isColorMaster
    ? `${baseUrl}/assets/produtos/color-master/offer/offer-1.webp`
    : (product.imageUrl ? `${baseUrl}${product.imageUrl}` : `${baseUrl}${SITE_CONFIG.seo.ogImage}`);

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'pt-BR': canonicalUrl,
      },
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: 'pt_BR',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${product.name} - Masterclass de Color Grading no DaVinci Resolve`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@mike_flmmkr',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const baseUrl = SITE_CONFIG.seo.url;
  const canonicalUrl = `${baseUrl}/produtos/${product.slug}`;

  // Render a landing page ultra especializada com JSON-LD para o Color Master
  if (product.slug === 'color-master-produto' || product.slug === 'color-master') {
    const courseSchema = {
      '@context': 'https://schema.org',
      '@type': 'Course',
      '@id': `${canonicalUrl}#course`,
      name: 'Color Master® | Produto',
      description:
        'Masterclass prática de Color Grading no DaVinci Resolve focada em comerciais de produto, publicidade e vídeos de alto impacto visual com footage real de TV.',
      inLanguage: 'pt-BR',
      provider: {
        '@type': 'Person',
        name: 'Michael Oliveira',
        jobTitle: 'Diretor, Diretor de Fotografia e Colorista',
        sameAs: SITE_CONFIG.social.map((s) => s.url),
      },
      publisher: {
        '@type': 'EducationalOrganization',
        name: SITE_CONFIG.name,
        url: baseUrl,
      },
      offers: {
        '@type': 'Offer',
        price: '195.00',
        priceCurrency: 'BRL',
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        priceValidUntil: '2026-12-31',
      },
      hasCourseInstance: {
        '@type': 'CourseInstance',
        courseMode: 'online',
        inLanguage: 'pt-BR',
      },
    };

    const productSchema = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      '@id': `${canonicalUrl}#product`,
      name: 'Color Master® | Produto',
      image: `${baseUrl}/assets/produtos/color-master/offer/offer-1.webp`,
      description:
        'Treinamento especializado em Color Grading para vídeos de produto e comerciais no DaVinci Resolve com Michael Oliveira.',
      brand: {
        '@type': 'Brand',
        name: 'FLMMKR',
      },
      offers: {
        '@type': 'Offer',
        price: '195.00',
        priceCurrency: 'BRL',
        priceValidUntil: '2026-12-31',
        availability: 'https://schema.org/InStock',
        url: canonicalUrl,
        seller: {
          '@type': 'Organization',
          name: SITE_CONFIG.name,
        },
      },
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Para quem é o masterclass Color Master | Produto?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'É indicado para videomakers, diretores de fotografia, editores e criadores de conteúdo que trabalham ou desejam atuar no mercado de comerciais, publicidade e vídeos de produto. A metodologia ensina o fluxo completo de ponta a ponta.',
          },
        },
        {
          '@type': 'Question',
          name: 'Quais conhecimentos prévios são necessários?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'É recomendável ter noções básicas da interface do DaVinci Resolve (criar nós e navegar pelas abas). O curso foca intensamente na metodologia, leitura visual e tomada de decisões técnicas e estéticas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Qual software e quais ferramentas são utilizados?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Utilizamos o DaVinci Resolve como plataforma central de trabalho. Além das ferramentas nativas do DaVinci, demonstramos ferramentas especializadas como o Dehancer Pro e Look Creator nos módulos dedicados de Look Development e emulação de película.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona o acesso e por quanto tempo terei direito?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O acesso é liberado imediatamente após a confirmação do pagamento e tem duração de 1 ano completo (365 dias). Durante esse período, você pode assistir a todas as aulas quantas vezes quiser e baixar os materiais e projetos.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona a mentoria individual para os 10 primeiros inscritos?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Os 10 primeiros inscritos ganham a Mentoria Individual ao vivo com Michael Oliveira em 1 sessão intensiva de mais de 3 horas para analisar trabalhos e buscar soluções práticas.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona o pagamento e quais são as formas disponíveis?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'O pagamento é processado com total segurança pelo Asaas (autorizado pelo Banco Central). Você pode parcelar em até 12x no cartão de crédito, pagar à vista via Pix com liberação imediata ou via boleto bancário.',
          },
        },
        {
          '@type': 'Question',
          name: 'Terei acesso aos arquivos e footage de comerciais reais para praticar?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Sim. Você terá acesso aos arquivos de projeto e às mídias originais em formato profissional de comerciais reais produzidos para clientes e marcas do mercado.',
          },
        },
        {
          '@type': 'Question',
          name: 'Como funciona a garantia incondicional de 7 dias?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Você tem 7 dias corridos a partir da compra. Se sentir que o treinamento não atendeu às suas expectativas, basta enviar um e-mail para receber 100% do valor de volta, sem burocracia.',
          },
        },
        {
          '@type': 'Question',
          name: 'O treinamento emite certificado de conclusão?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Por se tratar de uma Masterclass de imersão prática (focada em tomada de decisão e workflow de comerciais), o foco primordial é a construção de repertório e portfólio real com footage comercial profissional.',
          },
        },
      ],
    };

    const breadcrumbSchema = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: baseUrl,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Cursos',
          item: `${baseUrl}/#cursos`,
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: 'Color Master | Produto',
          item: canonicalUrl,
        },
      ],
    };

    const videoSchema = {
      '@context': 'https://schema.org',
      '@type': 'VideoObject',
      name: 'Color Master - Tratamento de Cor e Look de Produto no DaVinci Resolve',
      description: 'Showcase demonstrativo do pipeline de color grading para comerciais e vídeos publicitários de produto no DaVinci Resolve.',
      thumbnailUrl: ['https://img.youtube.com/vi/gp75L5H0kIU/maxresdefault.jpg'],
      uploadDate: '2026-01-01T00:00:00Z',
      embedUrl: 'https://www.youtube-nocookie.com/embed/gp75L5H0kIU',
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
        />
        <ColorMasterLanding />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] font-sans antialiased selection:bg-[#0071e3]/20 selection:text-[#0071e3]">
      <header className="relative z-10 border-b border-[#d2d2d7]/60 px-4 py-4 bg-[#ffffff]">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/#cursos"
            className="inline-flex items-center gap-1.5 text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar ao Site Principal</span>
          </Link>

          <span className="text-xs font-semibold text-[#0071e3] uppercase tracking-wider bg-[#0071e3]/10 px-3 py-1 rounded-full border border-[#0071e3]/20">
            {product.badge}
          </span>
        </div>
      </header>

      <main className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0071e3]/10 text-[#0071e3] text-xs font-semibold mb-6 border border-[#0071e3]/20">
            <Film className="w-4 h-4" />
            <span>Treinamento Oficial FLMMKR</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#1d1d1f] tracking-tight leading-tight mb-4">
            {product.name}
          </h1>

          <p className="text-lg md:text-xl text-[#0071e3] font-medium mb-6">
            {product.subtitle}
          </p>

          <p className="text-base sm:text-lg text-[#6e6e73] leading-relaxed mb-8 max-w-3xl">
            {product.description}
          </p>

          {/* Action Box / Sales Placeholder */}
          <div className="w-full p-6 md:p-8 rounded-3xl bg-[#ffffff] border border-[#e5e5e7] mb-10 shadow-sm">
            <h2 className="text-lg font-semibold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0071e3]" />
              <span>O que você vai aprender neste treinamento:</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-8">
              {product.highlights.map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-[#1d1d1f] bg-[#f5f5f7] p-3.5 rounded-2xl border border-[#e5e5e7]">
                  <CheckCircle2 className="w-4 h-4 text-[#0071e3] shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#e5e5e7]">
              <div className="flex flex-col text-center sm:text-left">
                <span className="text-xs text-[#86868b] font-medium">Lista de Espera</span>
                <span className="text-sm font-semibold text-[#1d1d1f]">Garanta seu lugar no próximo lançamento</span>
              </div>

              <a
                href={product.url}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0071e3] hover:bg-[#0077ed] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Entrar na Lista de Espera</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#d2d2d7]/60 py-8 px-4 text-center text-xs text-[#86868b]">
        © {new Date().getFullYear()} FLMMKR. Todos os direitos reservados.
      </footer>
    </div>
  );
}
