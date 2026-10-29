/** Validação da inscrição na Black November. Usada no navegador (feedback) e no servidor (a validação que vale). */
import { isValidEmail } from '@/utils/prisma2Lead';

export type BlackNovemberLeadClean = { name: string; email: string; phone: string | null };

const NAME_RE = /^[\p{L}][\p{L}\p{M} '.-]*$/u;
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, max + 1) : '');

export function validateBlackNovemberLead(input: Record<string, unknown>): { ok: true; data: BlackNovemberLeadClean } | { ok: false; field: 'name' | 'email' | 'phone'; error: string } {
  const name = clean(input.name, 80);
  if (name.length < 2 || name.length > 80 || !NAME_RE.test(name)) return { ok: false, field: 'name', error: 'Informe seu nome.' };
  const email = clean(input.email, 254).toLowerCase();
  if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'Informe um e-mail válido.' };
  const phone = typeof input.phone === 'string' ? input.phone.replace(/\D/g, '') : '';
  if (phone && !/^[0-9]{10,11}$/.test(phone)) return { ok: false, field: 'phone', error: 'WhatsApp com DDD (10 ou 11 dígitos).' };
  return { ok: true, data: { name, email, phone: phone || null } };
}
