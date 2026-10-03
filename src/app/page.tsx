import { headers } from 'next/headers';
import { Suspense } from 'react';
import { detectSocialBrowser } from '@/utils/detectBrowser';
import { MainClientSwitcher } from '@/components/MainClientSwitcher';

export const revalidate = 0; // Dynamic server rendering for header detection

export default async function HomePage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const referer = headersList.get('referer') || '';

  const initialDetection = detectSocialBrowser(userAgent, referer);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0B0E] text-zinc-100 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <MainClientSwitcher
        initialPlatform={initialDetection.platform}
        initialIsInApp={initialDetection.isInAppBrowser}
      />
    </Suspense>
  );
}
