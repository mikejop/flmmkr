import 'server-only';
import { createHmac } from 'node:crypto';

let warned = false;

/**
 * HMAC-SHA256 do IP com um segredo do servidor (IP_HASH_SALT). Serve para correlacionar acessos sem guardar o IP.
 * Sem IP ou sem o segredo, devolve null (nunca grava o IP em claro).
 */
export function hashClientIp(ip: string | null | undefined): string | null {
  const value = (ip || '').trim();
  if (!value) return null;
  const salt = process.env.IP_HASH_SALT?.trim();
  if (!salt) {
    if (!warned) {
      warned = true;
      console.warn('[ipHash] IP_HASH_SALT não configurada: o IP não será gravado.');
    }
    return null;
  }
  return createHmac('sha256', salt).update(value).digest('hex');
}
