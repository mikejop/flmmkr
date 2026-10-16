import 'server-only';
import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Cloudflare R2 (API compatível com S3). Só servidor: as chaves nunca vão para o navegador.
 * O bucket é PRIVADO: arquivos saem apenas por URL assinada de curta duração, depois de a rota checar o acesso do aluno.
 */
let client: S3Client | null = null;

function config() {
  const accountId = process.env.R2_ACCOUNT_ID?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  const bucket = process.env.R2_BUCKET?.trim();
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket) return null;
  return { accountId, accessKeyId, secretAccessKey, bucket };
}

export function isR2Configured(): boolean {
  return config() !== null;
}

function getClient(): { s3: S3Client; bucket: string } {
  const cfg = config();
  if (!cfg) throw new Error('R2 não configurado (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET).');
  client ??= new S3Client({
    region: 'auto',
    endpoint: `https://${cfg.accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey },
  });
  return { s3: client, bucket: cfg.bucket };
}

/**
 * Chave de objeto segura: só caracteres simples, sem "..", sem barra inicial, sem caracteres de controle.
 * Nunca use texto vindo do navegador como chave sem passar por uma lista de permitidos (veja privateMemberAssets).
 */
export function assertSafeKey(key: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9_\-./]{0,199}$/.test(key) || key.includes('..') || key.includes('//')) {
    throw new Error('Chave de arquivo inválida.');
  }
  return key;
}

/**
 * URL assinada de leitura. Validade curta (padrão 10 min, máximo 1 h).
 * Com `downloadAs`, o R2 responde com "Content-Disposition: attachment", então o navegador baixa o arquivo
 * direto, sem abrir página nem tocar no que está aberto.
 */
export async function getR2DownloadUrl(key: string, expiresInSeconds = 600, opts: { downloadAs?: string } = {}): Promise<string> {
  const { s3, bucket } = getClient();
  const ttl = Math.min(3600, Math.max(30, Math.floor(expiresInSeconds)));
  const safeName = opts.downloadAs?.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 100);
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: bucket,
      Key: assertSafeKey(key),
      ...(safeName ? { ResponseContentDisposition: `attachment; filename="${safeName}"` } : {}),
    }),
    { expiresIn: ttl }
  );
}

/** Grava um objeto (a chave é gerada pelo servidor; tamanho e tipo devem ser validados antes por quem chama). */
export async function putR2Object(key: string, body: Buffer | Uint8Array, contentType: string): Promise<void> {
  const { s3, bucket } = getClient();
  await s3.send(new PutObjectCommand({ Bucket: bucket, Key: assertSafeKey(key), Body: body, ContentType: contentType }));
}

export async function deleteR2Object(key: string): Promise<void> {
  const { s3, bucket } = getClient();
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: assertSafeKey(key) }));
}

export async function r2ObjectExists(key: string): Promise<boolean> {
  const { s3, bucket } = getClient();
  try {
    await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: assertSafeKey(key) }));
    return true;
  } catch {
    return false;
  }
}
