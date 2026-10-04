import { redirect } from 'next/navigation';

export default async function PrimeiroAcessoPage({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams();

  Object.entries(params).forEach(([key, val]) => {
    if (typeof val === 'string') {
      queryString.set(key, val);
    }
  });

  const query = queryString.toString();
  redirect(query ? `/definir-senha?${query}` : '/definir-senha');
}
