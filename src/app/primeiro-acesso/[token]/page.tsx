import React from 'react';
import { PrimeiroAcessoClient } from '@/components/PrimeiroAcessoClient';

export const metadata = {
  title: 'Primeiro Acesso — COLOR MASTER® | FLMMKR',
  description: 'Libere seu acesso e configure sua senha exclusiva.'
};

export default async function PrimeiroAcessoDynamicPage({
  params
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = await params;
  const token = resolvedParams.token || '';

  return <PrimeiroAcessoClient initialToken={token} />;
}
