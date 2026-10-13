import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE_CONFIG } from '@/config/siteConfig';
import { LESSON_SEO, LESSON_SEO_PUBLISHED, LESSON_SEO_UPDATED_AT } from '@/data/lessonSeo';

type Params = { modulo: string; aula: string };

const find = ({ modulo, aula }: Params) => !LESSON_SEO_PUBLISHED ? undefined : LESSON_SEO.find((l) => l.moduleSlug === modulo && l.slug === aula);

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  if (!LESSON_SEO_PUBLISHED) return [];
  return LESSON_SEO.map((l) => ({ modulo: l.moduleSlug, aula: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const lesson = find(await params);
  if (!lesson) return {};
  const url = `${SITE_CONFIG.seo.url}/aulas/${lesson.moduleSlug}/${lesson.slug}`;
  const title = `${lesson.title} — ${lesson.moduleTitle} | Color Master®`;
  return {
    title: { absolute: title },
    description: lesson.metaDescription,
    alternates: { canonical: url },
    // Limita o trecho exibido nos resultados (Google e Bing respeitam max-snippet).
    robots: 'index, follow, max-snippet:320, max-image-preview:large, max-video-preview:0',
    openGraph: {
      title,
      description: lesson.metaDescription,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.seo.locale,
      type: 'article',
    },
  };
}

export default async function LessonPreviewPage({ params }: { params: Promise<Params> }) {
  const lesson = find(await params);
  if (!lesson) notFound();

  const base = SITE_CONFIG.seo.url;
  const url = `${base}/aulas/${lesson.moduleSlug}/${lesson.slug}`;

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: lesson.title,
      description: lesson.metaDescription,
      url,
      inLanguage: 'pt-BR',
      isAccessibleForFree: false,
      dateModified: LESSON_SEO_UPDATED_AT,
      teaches: lesson.topics.map((t) => t.heading),
      author: { '@type': 'Person', name: SITE_CONFIG.author.name },
      provider: { '@type': 'Organization', name: SITE_CONFIG.name, url: base },
      isPartOf: { '@type': 'Course', name: 'Color Master® | Produto', url: `${base}/produtos/color-master-produto`, provider: { '@type': 'Organization', name: SITE_CONFIG.name } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'FLMMKR', item: base },
        { '@type': 'ListItem', position: 2, name: 'Aulas', item: `${base}/aulas` },
        { '@type': 'ListItem', position: 3, name: lesson.title, item: url },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      {jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
      ))}
      <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <nav aria-label="Navegação" className="text-sm text-neutral-600">
          <Link href="/" className="font-molde-heavy text-base tracking-tight text-[#1d1d1f]">FLMMKR</Link>
          <span aria-hidden="true"> / </span>
          <Link href="/aulas" className="hover:underline">Aulas</Link>
        </nav>

        <p className="mt-8 text-xs font-bold uppercase tracking-widest text-[#0071e3]">{lesson.moduleTitle}</p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight">{lesson.title}</h1>
        <p className="mt-4 text-lg text-neutral-700 leading-relaxed">
          Prévia da aula do Color Master® | Produto, com Michael Oliveira. Abaixo, a abertura de cada tópico;
          o conteúdo completo, os passos e os vídeos ficam na área de membros.
        </p>

        {lesson.learningOutcomes.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-bold">O que você aprende</h2>
            <ul className="mt-3 list-disc pl-6 space-y-1.5 text-neutral-800">
              {lesson.learningOutcomes.map((o) => <li key={o}>{o}</li>)}
            </ul>
          </section>
        )}

        {lesson.topics.map((topic) => (
          <section key={topic.id} id={topic.id} className="mt-10 scroll-mt-8">
            <h2 className="text-2xl font-bold tracking-tight">{topic.heading}</h2>
            <p className="mt-3 text-lg leading-relaxed text-neutral-800">{topic.opening}</p>
          </section>
        ))}

        <div data-nosnippet className="mt-14 rounded-2xl bg-[#f5f5f7] p-6">
          <p className="text-lg font-semibold">Continue esta aula na área de membros</p>
          <p className="mt-1 text-neutral-700">Explicações completas, passo a passo, exemplos e vídeos em um só lugar.</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/produtos/color-master-produto" className="rounded-full bg-[#0071e3] px-6 py-3 font-semibold text-white">Garantir acesso</Link>
            <Link href="/?login=true" className="rounded-full border border-neutral-300 px-6 py-3 font-semibold">Já sou aluno: entrar</Link>
          </div>
        </div>
      </article>
    </main>
  );
}
