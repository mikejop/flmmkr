import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    absolute: 'Color Master® | Produtos',
  },
  description: 'Área de Membros e Ambiente de Aprendizagem do Color Master® | Produtos por FLMMKR.',
  // Conteúdo exclusivo para alunos: fora dos buscadores. As prévias públicas ficam em /aulas.
  robots: { index: false, follow: false, nocache: true },
};

export default function ColorMasterProdutoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
