import ProductDetailPage, { generateMetadata as productMetadata } from '../produtos/[slug]/page';

// Landing do Color Master Produtos no endereço curto (/produtos/color-master-produto redireciona para cá).
export const revalidate = 86400;

const params = () => Promise.resolve({ slug: 'color-master-produto' });

export function generateMetadata() {
  return productMetadata({ params: params() });
}

export default function ColorMasterProdutoPage() {
  return ProductDetailPage({ params: params() });
}
