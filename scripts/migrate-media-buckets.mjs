#!/usr/bin/env node
import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const SOURCE_BUCKET = 'media';
const PUBLIC_BUCKET = 'site-public';
const PRIVATE_BUCKET = 'members-private';
const PUBLIC_PREFIXES = [
  'assets/artigos/introducao-davinci/',
  'assets/empresas/',
  'assets/produtos/color-grade-produto/',
  'assets/produtos/color-youtuber/',
  'assets/produtos/direcao-fotografia/',
  'assets/produtos/empreendedores/',
];
const PUBLIC_EXACT_PATHS = new Set([
  'assets/bg/about-mike/01.webp',
  'assets/bg/about-mike/02.jpg',
  'assets/bg/about-mike/02.webp',
  'assets/bg/about-mike/03.webp',
  'assets/bg/about-mike/04.webp',
  'assets/mike-photos/01.jpg',
  'assets/mike-photos/01.webp',
  'assets/mike-photos/02.webp',
  'assets/mike-photos/04.webp',
  'assets/produtos/color-master-produto/opengraph.jpg',
  'assets/produtos/color-master/01.jpg',
  'assets/produtos/color-master/offer/offer-1.webp',
  'assets/produtos/color-master/offer/offer-2.webp',
  'assets/produtos/color-master/offer/offer-3.webp',
  'assets/produtos/color-master/offer/offer-4.webp',
  'assets/produtos/color-master/offer/offer-5.webp',
  'assets/videos/dom-dourado-poster.webp',
  'banners/hero_01.webp',
  'banners/hero_02.webp',
  'banners/hero_03.webp',
  'banners/hero_04.webp',
  'hero-lighting.webp',
  'michael-oliveira.webp',
]);
const MEMBER_SOURCE_PATHS = new Set(['bg/02.webm', 'bg/02.webp']);
const MEMBER_TARGET_PATHS = {
  'bg/02.webm': 'member-assets/bg/2e3f243c2f59a450b701c41e4d6d7256.webm',
  'bg/02.webp': 'member-assets/bg/1bbfbfd533d2c667cde531daebbadf39.webp',
};
const IMAGE_MIME_TYPES = new Set([
  'image/webp', 'image/png', 'image/jpeg', 'image/svg+xml', 'image/avif',
]);
const DRY_RUN = process.argv.includes('--dry-run');
const APPLY = process.argv.includes('--apply');

function classify(object) {
  if (MEMBER_SOURCE_PATHS.has(object.path)) return 'members-private';
  if (/^video\//.test(object.mimeType || '')) return 'kept-in-media-video';
  const publicImage = IMAGE_MIME_TYPES.has(object.mimeType || '') && (
    PUBLIC_EXACT_PATHS.has(object.path) || PUBLIC_PREFIXES.some((prefix) => object.path.startsWith(prefix))
  );
  return publicImage ? 'site-public' : 'members-private-review';
}

async function getClient() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error('Configure SUPABASE_URL e SUPABASE_SECRET_KEY no ambiente local.');
  return createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function listBucketFiles(client, bucketName) {
  const bucket = client.storage.from(bucketName);
  const found = [];

  async function listFolder(folder) {
    let offset = 0;
    while (true) {
      const { data, error } = await bucket.list(folder, { limit: 1000, offset, sortBy: { column: 'name', order: 'asc' } });
      if (error) {
        const status = error.statusCode || error.status || 'sem status';
        const code = error.error || error.code || 'sem código';
        throw new Error(`Falha ao listar objetos de ${bucketName} (HTTP ${status}; ${code}).`);
      }
      for (const entry of data || []) {
        const objectPath = folder ? `${folder}/${entry.name}` : entry.name;
        if (entry.id === null) await listFolder(objectPath);
        else found.push({ path: objectPath, mimeType: entry.metadata?.mimetype || '', size: Number(entry.metadata?.size || 0) });
      }
      if (!data || data.length < 1000) break;
      offset += data.length;
    }
  }

  await listFolder('');
  return found;
}

function targetFor(object, destination, previousPath) {
  if (previousPath) return previousPath;
  if (MEMBER_TARGET_PATHS[object.path]) return MEMBER_TARGET_PATHS[object.path];
  const extension = path.posix.extname(object.path).toLowerCase();
  return `migrated/${randomUUID()}${extension}`;
}

async function copyObject(client, object, destination, targetPath) {
  const source = client.storage.from(SOURCE_BUCKET);
  const target = client.storage.from(destination);

  const { data: blob, error: downloadError } = await source.download(object.path);
  if (downloadError || !blob) throw new Error(`Falha ao baixar ${object.path}.`);

  const bytes = Buffer.from(await blob.arrayBuffer());
  const sourceHash = createHash('sha256').update(bytes).digest('hex');
  const { error: uploadError } = await target.upload(targetPath, bytes, {
    contentType: object.mimeType,
    cacheControl: destination === PUBLIC_BUCKET ? '31536000' : '300',
    upsert: false,
  });

  if (uploadError) {
    const { data: existingObject, error: existingError } = await target.download(targetPath);
    if (existingError || !existingObject) throw new Error(`Falha ao enviar ${object.path} para ${destination}.`);
    const existingBytes = Buffer.from(await existingObject.arrayBuffer());
    const existingHash = createHash('sha256').update(existingBytes).digest('hex');
    if (existingHash !== sourceHash) throw new Error(`O destino já existe com conteúdo diferente: ${destination}/${targetPath}.`);
  }

  const { data: copiedObject, error: verifyError } = await target.download(targetPath);
  if (verifyError || !copiedObject) throw new Error(`Não foi possível validar ${destination}/${targetPath}.`);
  const copiedBytes = Buffer.from(await copiedObject.arrayBuffer());
  const copiedHash = createHash('sha256').update(copiedBytes).digest('hex');
  if (copiedHash !== sourceHash) throw new Error(`Hash SHA-256 divergente em ${destination}/${targetPath}.`);

  return bytes.byteLength;
}

async function main() {
  if (!DRY_RUN && !APPLY) {
    console.log('Use --dry-run para conferir a classificação ou --apply para copiar os objetos.');
    process.exitCode = 2;
    return;
  }

  const client = await getClient();
  const objects = await listBucketFiles(client, SOURCE_BUCKET);
  const map = [];
  let copied = 0;
  const reportPath = path.join(process.cwd(), 'docs/security/storage-migration-map.json');
  let previousObjects = [];
  if (APPLY) {
    try {
      const existing = JSON.parse(await readFile(reportPath, 'utf8'));
      previousObjects = Array.isArray(existing.objects) ? existing.objects : [];
    } catch {
      previousObjects = [];
    }
  }
  const previousBySource = new Map(previousObjects.map((row) => [row.sourcePath, row]));
  const persistMap = async () => {
    const currentSources = new Set(map.map((row) => row.sourcePath));
    const persistedObjects = [...map, ...previousObjects.filter((row) => !currentSources.has(row.sourcePath))];
    await mkdir(path.dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), copiedBytes: copied, objects: persistedObjects }, null, 2)}\n`);
  };

  for (const object of objects) {
    const destination = classify(object);
    const status = destination === 'kept-in-media-video' ? 'mantido no bucket media' : 'cópia pendente';
    if (destination === 'kept-in-media-video') {
      console.log(`${destination}\t${object.path}\t${object.size}\t${object.mimeType || 'sem MIME'}\t${status}`);
      continue;
    }

    const targetBucket = destination === 'site-public' ? PUBLIC_BUCKET : PRIVATE_BUCKET;
    const previous = previousBySource.get(object.path);
    const targetPath = targetFor(object, targetBucket, previous?.destinationPath);
    const mapping = { sourceBucket: SOURCE_BUCKET, sourcePath: object.path, destinationBucket: targetBucket, destinationPath: targetPath, classification: destination, size: object.size, mimeType: object.mimeType, verified: Boolean(previous?.verified) };
    map.push(mapping);

    if (APPLY) {
      copied += await copyObject(client, object, targetBucket, targetPath);
      mapping.verified = true;
      await persistMap();
      console.log(`copiado\t${object.path}\t${targetBucket}/${targetPath}\t${object.size}`);
    } else {
      console.log(`${destination}\t${object.path}\t${targetBucket}/${targetPath}\t${object.size}\t${object.mimeType || 'sem MIME'}`);
    }
  }

  const counts = map.reduce((result, row) => {
    result[row.classification] = (result[row.classification] || 0) + 1;
    return result;
  }, {});
  console.log(`\nInventário: ${objects.length} objetos; ${JSON.stringify(counts)}; vídeos legados mantidos no bucket media.`);

  if (APPLY) {
    await persistMap();
    console.log(`Mapa antigo → novo gravado em ${reportPath}. Nenhum objeto de origem foi removido.`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha na migração de Storage.');
  process.exitCode = 1;
});
