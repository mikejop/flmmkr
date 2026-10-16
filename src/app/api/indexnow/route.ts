import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';
import { LESSON_SEO, LESSON_SEO_PUBLISHED } from '@/data/lessonSeo';
import { z } from 'zod';
import { consumeRateLimit, readJsonLimited } from '@/utils/rateLimit';

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '9defba3c0eed46355fe7313d2ff6c5d1';

/**
 * Endpoint para notificar o Bing (IndexNow) sobre as URLs do site.
 * Suporta POST com lista de URLs customizadas ou GET para submissão de todas as páginas públicas.
 */
const urlsSchema = z.object({ urls: z.array(z.string().url()).min(1).max(20) }).strict();

async function submit(urlList: string[]) {
  const key = INDEXNOW_KEY;
  const host = new URL(SITE_CONFIG.seo.url).host;
  const keyLocation = `https://${host}/${key}.txt`;
  const payload = { host, key, keyLocation, urlList };
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(payload),
  });
  return { success: res.ok, status: res.status, submittedUrlsCount: urlList.length };
}

export async function GET(req: NextRequest) {
  const allowed = await consumeRateLimit(req, 'indexnow-get', 3, 60 * 60);
  if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
  const baseUrl = SITE_CONFIG.seo.url;
  const urlList = [
    `${baseUrl}/`,
    `${baseUrl}/cursos`,
    `${baseUrl}/links`,
    ...PRODUCTS.map(p => `${baseUrl}/produtos/${p.slug}`),
    ...(LESSON_SEO_PUBLISHED
      ? [`${baseUrl}/aulas`, ...LESSON_SEO.map(l => `${baseUrl}/aulas/${l.moduleSlug}/${l.slug}`)]
      : [])
  ];

  try {
    return NextResponse.json(await submit(urlList));
  } catch (error: any) {
    console.error('[indexnow]', error);
    return NextResponse.json(
      { error: 'Erro ao comunicar com o IndexNow' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const allowed = await consumeRateLimit(req, 'indexnow-post', 5, 60 * 60);
    if (allowed === null) return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 503 });
    if (!allowed) return NextResponse.json({ error: 'Muitas requisições.' }, { status: 429 });
    const body = await readJsonLimited(req, 8_192);
    if (!body) return NextResponse.json({ error: 'Requisição inválida ou muito grande.' }, { status: 400 });
    const parsed = urlsSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos.' }, { status: 400 });
    const expectedOrigin = new URL(SITE_CONFIG.seo.url).origin;
    const urls = parsed.data.urls.map((value) => new URL(value));
    if (urls.some((url) => url.origin !== expectedOrigin || url.username || url.password || url.hash)) {
      return NextResponse.json({ error: 'Só são aceitas URLs públicas deste site.' }, { status: 400 });
    }
    return NextResponse.json(await submit(urls.map((url) => url.toString())));
  } catch (error: any) {
    console.error('[indexnow]', error);
    return NextResponse.json(
      { error: 'Erro ao enviar para IndexNow' },
      { status: 500 }
    );
  }
}
