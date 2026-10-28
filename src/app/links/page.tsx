import React, { Suspense } from 'react';
import { SocialLanding } from '@/components/SocialLanding';

// Conteúdo público definido em código: estático, regenerado no máximo 1x por dia (ou no deploy).
export const revalidate = 86400;

export const metadata = {
  title: 'Links & Cursos | Michael Oliveira',
  description: 'Acesse rapidamente todos os cursos e masterclasses de Michael Oliveira.',
  // Sem isto a página herda o canonical '/' do layout raiz e o Google a trata como cópia da home.
  alternates: { canonical: '/links' },
};

export default function LinksPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0B0E] text-zinc-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SocialLanding platform="other" />
    </Suspense>
  );
}
