import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_CONFIG } from '@/config/siteConfig';
import { notFound } from 'next/navigation';
import { LESSON_SEO, LESSON_SEO_PUBLISHED } from '@/data/lessonSeo';

const PAGE_URL = `${SITE_CONFIG.seo.url}/aulas`;
const TITLE = 'Aulas do Color Master® | Produto — conteúdo do curso';
const DESCRIPTION =
  'Veja o que cada aula do Color Master® | Produto ensina: color grading no DaVinci Resolve para vídeos de produto e comerciais. Prévia dos tópicos; o conteúdo completo é exclusivo para alunos.';

// Conteúdo público definido em código: estático, regenerado no máximo 1x por dia (ou no deploy).
export const revalidate = 86400;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  robots: 'index, follow, max-snippet:320, max-image-preview:large, max-video-preview:0',
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: SITE_CONFIG.name, locale: SITE_CONFIG.seo.locale, type: 'website' },
};

export default function AulasIndexPage() {
  if (!LESSON_SEO_PUBLISHED) notFound();
  const modules = Array.from(new Set(LESSON_SEO.map((l) => l.moduleSlug))).map((slug) => {
    const lessons = LESSON_SEO.filter((l) => l.moduleSlug === slug);
    return { slug, title: lessons[0].moduleTitle, lessons };
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: TITLE,
    itemListElement: LESSON_SEO.map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `${SITE_CONFIG.seo.url}/aulas/${l.moduleSlug}/${l.slug}`,
      name: l.title,
    })),
  };

  return (
    <main className="min-h-screen bg-white text-[#1d1d1f]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
        <Link href="/" className="font-molde-heavy text-lg tracking-tight">FLMMKR</Link>
        <h1 className="mt-8 text-3xl sm:text-4xl font-extrabold tracking-tight">Aulas do Color Master® | Produto</h1>
        <p className="mt-3 text-lg text-neutral-700 leading-relaxed">
          Masterclass de color grading no DaVinci Resolve para vídeos de produto e comerciais, com Michael Oliveira.
          Aqui você vê o que cada aula aborda. As aulas completas ficam na área de membros.
        </p>

        {modules.map((m) => (
          <section key={m.slug} className="mt-10">
            <h2 className="text-xl font-bold">{m.title}</h2>
            <ul className="mt-3 divide-y divide-neutral-200 border-y border-neutral-200">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  <Link href={`/aulas/${l.moduleSlug}/${l.slug}`} className="block py-4 hover:bg-neutral-50">
                    <span className="block font-semibold text-[#0071e3]">{l.title}</span>
                    <span className="mt-1 block text-neutral-600">{l.metaDescription}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <div data-nosnippet className="mt-12 rounded-2xl bg-[#f5f5f7] p-6">
          <p className="font-semibold">Quer ver as aulas completas?</p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/produtos/color-master-produto" className="rounded-full bg-[#0071e3] px-6 py-3 font-semibold text-white">Garantir acesso</Link>
            <Link href="/?login=true" className="rounded-full border border-neutral-300 px-6 py-3 font-semibold">Já sou aluno: entrar</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
