import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Color Master® | Produtos',
  },
  description: 'Área de Membros e Ambiente de Aprendizagem do Color Master® | Produtos por FLMMKR.',
};

export default function ColorMasterProdutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
