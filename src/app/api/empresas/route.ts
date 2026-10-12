import { NextResponse } from 'next/server';
import { getMediaUrl } from '@/lib/storage';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const companies = [
    ['Astronautas Filmes', 'astronautas-filmes.jpg'],
    ['At Work', 'at-work.jpg'],
    ['Embratur', 'embratur.png'],
    ['Malala Filmes', 'malala-filmes.jpg'],
    ['Mandrill', 'mandrill.png'],
    ['Maria Quitéria', 'maria-quiteria.jpg'],
    ['Mariposa Filmes', 'mariposa-filmes.jpg'],
    ['Pantanal Filmes', 'pantanal-filmes.jpg'],
    ['Plano B', 'plano-b.jpg'],
  ];

  return NextResponse.json({
    logos: companies.map(([name, file]) => ({
      name,
      src: getMediaUrl(`assets/empresas/${file}`),
    })),
  });
}
