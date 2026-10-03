import React from 'react';
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

export async function generateMetadata({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);
  if (!product) return {};

  return {
    title: `${product.name} | ${SITE_CONFIG.name}`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const resolvedParams = await params;
  const product = PRODUCTS.find((p) => p.slug === resolvedParams.slug);

  if (!product) {
    notFound();
  }

  // Render a landing page ultra especializada se for o Color Master
  if (product.slug === 'color-master-produto' || product.slug === 'color-master') {
    return <ColorMasterLanding />;
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
