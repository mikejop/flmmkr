import type { Metadata } from 'next';
import Prisma2ResetForm from '@/components/prisma2/Prisma2ResetForm';

// Link de redefinição de senha do PRISMA 2 (https://flmmkr.site/prisma/<token>): uso único, fora dos buscadores e sem Referer (o token não vaza).
export const metadata: Metadata = {
  title: { absolute: 'Nova senha - PRISMA 2 | FLMMKR' },
  robots: { index: false, follow: false, nocache: true },
  referrer: 'no-referrer',
  icons: {
    icon: [
      { url: '/prisma2/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/prisma2/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/prisma2/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default async function Prisma2ResetPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <Prisma2ResetForm token={token} />;
}
