import 'server-only';
import { createHmac } from 'node:crypto';

const TWO_HOURS_SECONDS = 2 * 60 * 60;

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');

/** Limita o texto da marca d'água (aparece em cima do vídeo). */
const clip = (value: string, max: number) => value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

/**
 * Token JWT (HS256) do DRM/marca d'água do Panda: { drm_group_id, string1, string2, string3 } assinado com o
 * segredo do grupo e válido por 2 horas. Formato: help.pandavideo.com, "How to integrate Panda Video's DRM via API?".
 * Sem PANDA_DRM_GROUP_ID e PANDA_DRM_SECRET devolve null (o player segue sem marca d'água até configurar).
 */
export function createPandaDrmToken(student: { name?: string | null; email?: string | null }): string | null {
  const groupId = process.env.PANDA_DRM_GROUP_ID?.trim();
  const secret = process.env.PANDA_DRM_SECRET?.trim();
  if (!groupId || !secret) return null;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    drm_group_id: groupId,
    string1: 'Licenciado para',
    string2: clip(student.name || 'Aluno', 60),
    string3: clip(student.email || '', 80),
    iat: now,
    exp: now + TWO_HOURS_SECONDS,
  };
  const header = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64url(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}
