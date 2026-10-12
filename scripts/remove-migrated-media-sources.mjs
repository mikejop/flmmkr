#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import nextEnv from '@next/env';
import { createClient } from '@supabase/supabase-js';

nextEnv.loadEnvConfig(process.cwd());

const SOURCE_BUCKET = 'media';
const APPROVED_SOURCES = [
  'bg/02.webm',
  'bg/02.webp',
  '1 ponto de luz.webp',
  '1 ponto.webp',
  'assets/bg/about-mike/01.jpg',
  'assets/bg/about-mike/03.jpg',
  'assets/bg/about-mike/04.jpg',
  'assets/bg/about-mike/orig/02.jpg',
  'assets/mike-photos/02.jpg',
  'assets/mike-photos/04.jpg',
  'assets/produtos/color-master/offer/orig/offer-1.webp',
  'assets/produtos/color-master/offer/orig/offer-2.webp',
  'assets/produtos/color-master/offer/orig/offer-3.webp',
  'assets/produtos/color-master/offer/orig/offer-4.webp',
  'assets/produtos/color-master/offer/orig/offer-5.webp',
  'assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.05.47.webp',
  'assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.04.webp',
  'assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.19.webp',
  'assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.06.43.webp',
  'assets/produtos/color-master/offer/Screenshot 2026-10-03 at 22.07.01.webp',
  'assets/produtos/color-master/opengraph.jpg',
  'banners/banner01.webp',
  'banners/banner02.webp',
  'celulares.webp',
  'dois pontos de luz.webp',
  'hero.webp',
  'luz colorida rgb.webp',
  'o que importa.webp',
  'Photo-Album-1---001.webp',
  'Photo-Album-1---002.webp',
  'Photo-Album-1---003.webp',
  'Photo-Album-1---005.webp',
  'Photo-Album-1---008.webp',
  'Photo-Album-1---009.webp',
  'Photo-Album-1---015.webp',
  'setup entrevista.webp',
];
const APPLY = process.argv.includes('--apply');
const DRY_RUN = process.argv.includes('--dry-run');

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

async function main() {
  if (APPLY === DRY_RUN) throw new Error('Use exatamente uma opção: --dry-run ou --apply.');
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) throw new Error('Configure as credenciais privadas do Supabase no ambiente local.');

  const mapPath = path.join(process.cwd(), 'docs/security/storage-migration-map.json');
  const mapFile = JSON.parse(await readFile(mapPath, 'utf8'));
  const bySource = new Map((mapFile.objects || []).map((row) => [row.sourcePath, row]));
  const client = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
  const verified = [];

  for (const sourcePath of APPROVED_SOURCES) {
    const row = bySource.get(sourcePath);
    if (!row || row.sourceBucket !== SOURCE_BUCKET || !row.verified || !row.destinationPath) {
      throw new Error('Sem cópia registrada como validada para ' + sourcePath + '; nenhuma origem foi removida.');
    }
    const { data: source, error: sourceError } = await client.storage.from(SOURCE_BUCKET).download(sourcePath);
    const { data: destination, error: destinationError } = await client.storage.from(row.destinationBucket).download(row.destinationPath);
    if (sourceError || !source || destinationError || !destination) {
      throw new Error('Não foi possível reler origem e destino para ' + sourcePath + '; nenhuma origem foi removida.');
    }
    const sourceBytes = Buffer.from(await source.arrayBuffer());
    const destinationBytes = Buffer.from(await destination.arrayBuffer());
    if (sha256(sourceBytes) !== sha256(destinationBytes) || sourceBytes.byteLength !== Number(row.size)) {
      throw new Error('Validação SHA-256 ou tamanho falhou para ' + sourcePath + '; nenhuma origem foi removida.');
    }
    verified.push(sourcePath);
    console.log('validado\t' + sourcePath + '\t' + row.destinationBucket + '/' + row.destinationPath + '\t' + sourceBytes.byteLength);
  }

  if (verified.length !== APPROVED_SOURCES.length) {
    throw new Error('A quantidade validada não coincide com a lista aprovada; nenhuma origem foi removida.');
  }
  if (DRY_RUN) {
    console.log('\nDry-run: ' + verified.length + ' objetos passaram pela validação; nenhuma origem foi removida.');
    return;
  }

  const { data, error } = await client.storage.from(SOURCE_BUCKET).remove(verified);
  if (error) throw new Error('A remoção retornou erro: ' + error.message);
  const removed = new Set((data || []).map((row) => row.name));
  const missing = verified.filter((sourcePath) => !removed.has(sourcePath));
  if (missing.length) throw new Error('A API não confirmou a remoção de ' + missing.length + ' objetos: ' + missing.join(', '));
  console.log('\nRemovidos ' + removed.size + ' objetos antigos do bucket ' + SOURCE_BUCKET + ', após validar os destinos por SHA-256.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Falha ao remover origens migradas.');
  process.exitCode = 1;
});
