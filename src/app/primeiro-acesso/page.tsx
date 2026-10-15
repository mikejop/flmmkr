import React from 'react';
import { PrimeiroAcessoClient } from '@/components/PrimeiroAcessoClient';

// Rota com CSP por nonce: precisa de renderização dinâmica (o nonce muda a cada requisição).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Primeiro Acesso — COLOR MASTER® | FLMMKR',
  description: 'Libere seu acesso e configure sua senha exclusiva.'
};

export default async function PrimeiroAcessoPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const token = typeof params.token === 'string' ? params.token : '';

  return <PrimeiroAcessoClient initialToken={token} />;
}
