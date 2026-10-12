/*
 * FLMMKR — proxy de cache no navegador (Service Worker).
 *
 * Objetivo: poupar banco de dados e servidor (Vercel/Supabase). Arquivos pesados e estáveis da
 * área de membros e as imagens públicas do site ficam guardados no computador do aluno por até
 * 7 dias, ou até o sistema mudar (nova versão => novo `?v=` no registro => caches antigos apagados).
 *
 * O que passa por aqui:
 *  1. /api/members/file?path=...  -> arquivos privados (fundo da área de membros etc.).
 *     A resposta é guardada pela chave lógica do arquivo, não pela URL assinada (que expira em 10 min).
 *     Só é gravada depois que o servidor autorizou (HTTP 200). Suporta Range (vídeo).
 *  2. Supabase Storage público (bucket site-public) -> imagens do site.
 *
 * O que NUNCA passa por aqui: rotas de dados (/api/*), HTML, vídeo das aulas (Panda), auth.
 */
const VERSION = new URL(self.location.href).searchParams.get('v') || 'dev';
const PRIVATE_CACHE = `flmmkr-private-${VERSION}`;
const PUBLIC_CACHE = `flmmkr-public-${VERSION}`;
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const STAMP = 'x-sw-cached-at';
const PUBLIC_PREFIX = '/storage/v1/object/public/site-public/';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((n) => n.startsWith('flmmkr-') && n !== PRIVATE_CACHE && n !== PUBLIC_CACHE)
          .map((n) => caches.delete(n))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;
  if (type === 'PURGE_PRIVATE') {
    event.waitUntil(caches.delete(PRIVATE_CACHE));
  } else if (type === 'PURGE_ALL') {
    event.waitUntil(Promise.all([caches.delete(PRIVATE_CACHE), caches.delete(PUBLIC_CACHE)]));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin === self.location.origin && url.pathname === '/api/members/file') {
    event.respondWith(handlePrivateFile(request, url));
    return;
  }
  if (url.protocol === 'https:' && url.hostname.endsWith('.supabase.co') && url.pathname.startsWith(PUBLIC_PREFIX)) {
    event.respondWith(handlePublicAsset(request));
  }
});

const inflight = new Map();

function isFresh(response) {
  const at = Number(response.headers.get(STAMP) || 0);
  const age = Date.now() - at;
  return at > 0 && age >= 0 && age < MAX_AGE_MS;
}

async function stamp(response) {
  const blob = await response.blob();
  const headers = new Headers();
  headers.set('content-type', response.headers.get('content-type') || 'application/octet-stream');
  headers.set(STAMP, String(Date.now()));
  return new Response(blob, { status: 200, headers });
}

/** Responde pedidos Range (vídeo) a partir do arquivo inteiro guardado. */
async function serveRange(request, response) {
  const range = request.headers.get('range');
  if (!range) return response.clone();
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  if (!match) return response.clone();

  const blob = await response.clone().blob();
  const size = blob.size;
  let start = match[1] === '' ? NaN : Number(match[1]);
  let end = match[2] === '' ? NaN : Number(match[2]);
  if (Number.isNaN(start) && Number.isNaN(end)) return response.clone();
  if (Number.isNaN(start)) {
    start = Math.max(0, size - end);
    end = size - 1;
  } else if (Number.isNaN(end) || end >= size) {
    end = size - 1;
  }
  if (start > end || start >= size) {
    return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
  }

  return new Response(blob.slice(start, end + 1), {
    status: 206,
    headers: {
      'Content-Type': response.headers.get('content-type') || 'application/octet-stream',
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Content-Length': String(end - start + 1),
      'Accept-Ranges': 'bytes',
    },
  });
}

async function handlePrivateFile(request, url) {
  const path = url.searchParams.get('path') || '';
  if (!path) return fetch(request);

  const cache = await caches.open(PRIVATE_CACHE);
  const key = new Request(`${self.location.origin}/__private__/${encodeURIComponent(path)}`);

  const cached = await cache.match(key);
  if (cached && isFresh(cached)) return serveRange(request, cached);

  let pending = inflight.get(path);
  if (!pending) {
    pending = (async () => {
      // Pedido novo e completo (sem Range): o servidor valida a sessão/pagamento e redireciona
      // para a URL assinada; o cache guarda o arquivo inteiro uma única vez.
      const res = await fetch(new Request(url.href, { credentials: 'same-origin', redirect: 'follow' }));
      if (res.status === 200) {
        const stamped = await stamp(res);
        await cache.put(key, stamped.clone());
        return stamped;
      }
      // Não autorizado / removido: apaga qualquer cópia local e repassa o erro.
      await cache.delete(key);
      return res;
    })().finally(() => inflight.delete(path));
    inflight.set(path, pending);
  }

  try {
    const res = await pending;
    return res.status === 200 ? serveRange(request, res) : res.clone();
  } catch (err) {
    // Sem rede: serve a cópia antiga em vez de falhar.
    if (cached) return serveRange(request, cached);
    throw err;
  }
}

async function handlePublicAsset(request) {
  const cache = await caches.open(PUBLIC_CACHE);
  const cached = await cache.match(request.url);
  if (cached && isFresh(cached)) return cached;

  try {
    // CORS explícito para poder ler o corpo e carimbar a data (o <img> comum seria opaco).
    const res = await fetch(new Request(request.url, { mode: 'cors', credentials: 'omit' }));
    if (res.status === 200) {
      const stamped = await stamp(res);
      await cache.put(request.url, stamped.clone());
      return stamped;
    }
    return cached || res;
  } catch {
    if (cached) return cached;
    return fetch(request);
  }
}
