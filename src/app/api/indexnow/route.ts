import { NextRequest, NextResponse } from 'next/server';
import { PRODUCTS } from '@/config/products';
import { SITE_CONFIG } from '@/config/siteConfig';

export const dynamic = 'force-dynamic';

const INDEXNOW_KEY = '9defba3c0eed46355fe7313d2ff6c5d1';
const HOST = 'flmmkr.site';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

/**
 * Endpoint para notificar o Bing (IndexNow) sobre as URLs do site.
 * Suporta POST com lista de URLs customizadas ou GET para submissão de todas as páginas públicas.
 */
export async function GET() {
  const baseUrl = SITE_CONFIG.seo.url;
  const urlList = [
    `${baseUrl}/`,
    `${baseUrl}/color-master-produto`,
    `${baseUrl}/cursos`,
    `${baseUrl}/conteudo`,
    `${baseUrl}/links`,
    `${baseUrl}/primeiro-acesso`,
    `${baseUrl}/definir-senha`,
    ...PRODUCTS.map(p => `${baseUrl}/produtos/${p.slug}`)
  ];

  try {
    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submittedUrlsCount: urlList.length,
      urlList,
      indexNowEndpoint: 'https://api.indexnow.org/indexnow',
      keyLocation: KEY_LOCATION
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao comunicar com o IndexNow' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body.urls) && body.urls.length > 0
      ? body.urls
      : [`${SITE_CONFIG.seo.url}/`];

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    return NextResponse.json({
      success: res.ok,
      status: res.status,
      submittedUrls: urls
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Erro ao enviar para IndexNow' },
      { status: 500 }
    );
  }
}
