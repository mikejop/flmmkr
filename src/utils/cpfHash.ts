import 'server-only';
import { createHmac } from 'node:crypto';

/** Hash do CPF (HMAC-SHA256) só para a regra "1 reembolso por CPF e produto". O CPF em si nunca é guardado pelo reembolso. */
export function hashCpf(cpf: string): string | null {
  const salt = process.env.CPF_HASH_SALT?.trim() || process.env.RATE_LIMIT_HMAC_SECRET?.trim();
  const digits = (cpf || '').replace(/\D/g, '');
  if (!salt || digits.length < 11) return null;
  return createHmac('sha256', salt).update(`cpf:${digits}`).digest('hex');
}
