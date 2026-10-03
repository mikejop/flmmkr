import React, { Suspense } from 'react';
import { OfficialLanding } from '@/components/OfficialLanding';

export const metadata = {
  title: 'Treinamentos | Michael Oliveira',
  description: 'Conheça todos os treinamentos de Direção de Fotografia e Color Grading com Michael Oliveira.',
};

export default function CursosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0B0E] text-zinc-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#0071e3] border-t-transparent animate-spin" />
        </div>
      }
    >
      <OfficialLanding platform="other" />
    </Suspense>
  );
}
