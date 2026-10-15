import { Suspense } from 'react';
import { MainClientSwitcher } from '@/components/MainClientSwitcher';

// Página pública estática: a detecção do navegador interno (Instagram/TikTok) roda no cliente, em MainClientSwitcher.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0B0E] text-zinc-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MainClientSwitcher />
    </Suspense>
  );
}
