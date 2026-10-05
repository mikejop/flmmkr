import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Color Master | Produto — Área de Membros',
  description: 'Área de Membros e Ambiente de Aprendizagem do Color Master Produto por FLMMKR.',
};

export default function ColorMasterProdutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
