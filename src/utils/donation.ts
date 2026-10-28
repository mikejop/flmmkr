/** Doação dos plugins: valor e dados do cartão. Usada no navegador (feedback) e no servidor (a validação que vale). */

import { BR_STATES, validatePrisma2Lead } from '@/utils/prisma2Lead';

export const DONATION_MIN = 5;
export const DONATION_MAX = 5000;
export const DONATION_PRESETS = [10, 25, 50, 100];
/** Prefixo do externalReference das doações no Asaas: o webhook usa para não tratar doação como compra de curso. */
export const DONATION_REF_PREFIX = 'flmmkr_plugins_donation_';
export const DONATION_DESCRIPTION = 'Doação FLMMKR Plugins';

const onlyDigits = (v: unknown) => (typeof v === 'string' ? v.replace(/\D/g, '') : '');

/** "12,50", "R$ 12.50" ou 12.5 → 12.5 (duas casas). NaN se não for número. */
export function parseAmount(value: unknown): number {
  if (typeof value === 'number') return Math.round(value * 100) / 100;
  if (typeof value !== 'string') return NaN;
  const cleaned = value.replace(/[^\d,.]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const n = Number(cleaned);
  return cleaned && Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

export function amountError(amount: number): string | null {
  if (!Number.isFinite(amount)) return 'Informe o valor da doação.';
  if (amount < DONATION_MIN) return `O valor mínimo para doar é R$ ${DONATION_MIN},00.`;
  if (amount > DONATION_MAX) return `O valor máximo por doação é R$ ${DONATION_MAX.toLocaleString('pt-BR')},00.`;
  return null;
}

export const formatBRL = (n: number) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function isValidCpf(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const check = (len: number) => {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return check(9) === Number(cpf[9]) && check(10) === Number(cpf[10]);
}

function isValidCnpj(cnpj: string): boolean {
  if (!/^\d{14}$/.test(cnpj) || /^(\d)\1{13}$/.test(cnpj)) return false;
  const check = (len: number) => {
    const weights = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = weights.reduce((acc, w, i) => acc + Number(cnpj[i]) * w, 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  return check(12) === Number(cnpj[12]) && check(13) === Number(cnpj[13]);
}

export const isValidCpfCnpj = (v: string) => {
  const d = onlyDigits(v);
  return d.length === 11 ? isValidCpf(d) : isValidCnpj(d);
};

function luhn(number: string): boolean {
  let sum = 0;
  for (let i = 0; i < number.length; i++) {
    let d = Number(number[number.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

/** Máscaras de digitação */
export const maskCard = (v: string) => onlyDigits(v).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
export const maskExpiry = (v: string) => {
  const d = onlyDigits(v).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};
export const maskCpfCnpj = (v: string) => {
  const d = onlyDigits(v).slice(0, 14);
  if (d.length <= 11) return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return d.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2');
};
/** Campo de e-mail: só caracteres válidos em endereço de e-mail, sem espaço e com um único @. */
export const maskEmail = (v: string) => {
  const cleaned = v.replace(/[^A-Za-z0-9._%+@-]/g, '').slice(0, 254);
  const at = cleaned.indexOf('@');
  return at === -1 ? cleaned : cleaned.slice(0, at + 1) + cleaned.slice(at + 1).replace(/@/g, '');
};
export const maskCep = (v: string) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2');

export type DonorField = 'firstName' | 'lastName' | 'email' | 'phone' | 'postalCode' | 'street' | 'addressNumber' | 'city' | 'state';

export type DonorClean = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  postal_code: string | null;
  street: string | null;
  address_number: string | null;
  city: string | null;
  state: string | null;
};

const STATE_CODES = new Set<string>(BR_STATES.map(([code]) => code));
const cleanText = (v: unknown, max: number) => (typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, max + 1) : '');
const UNSAFE_RE = /[<>{}`\\\u0000-\u001f\u007f]/;

/**
 * Dados de quem doa. Nome, sobrenome e e-mail são obrigatórios; telefone e endereço são opcionais,
 * exceto no cartão (`forCard`), em que o Asaas exige telefone, CEP e número.
 */
export function validateDonor(
  input: Partial<Record<DonorField, unknown>>,
  forCard: boolean,
): { ok: true; data: DonorClean } | { ok: false; field: DonorField; error: string } {
  // Nome, sobrenome e e-mail: mesmas regras do cadastro de download.
  const base = validatePrisma2Lead({ firstName: input.firstName, lastName: input.lastName, email: input.email });
  if (!base.ok) return { ok: false, field: base.field as DonorField, error: base.error };

  const phone = onlyDigits(input.phone);
  const postalCode = onlyDigits(input.postalCode);
  const street = cleanText(input.street, 120);
  const addressNumber = cleanText(input.addressNumber, 10);
  const city = cleanText(input.city, 80);
  const state = cleanText(input.state, 2).toUpperCase();
  const cardNote = ' (obrigatório no cartão)';

  if (phone ? !/^[1-9]{2}9?\d{8}$/.test(phone) : forCard) return { ok: false, field: 'phone', error: `Informe um telefone válido com DDD${phone ? '' : cardNote}.` };
  if (postalCode ? !/^\d{8}$/.test(postalCode) : forCard) return { ok: false, field: 'postalCode', error: `CEP inválido${postalCode ? '' : cardNote}.` };
  if (street && (street.length > 120 || UNSAFE_RE.test(street))) return { ok: false, field: 'street', error: 'Endereço inválido.' };
  if (addressNumber ? addressNumber.length > 10 || !/^[\p{L}\d /-]+$/u.test(addressNumber) : forCard) {
    return { ok: false, field: 'addressNumber', error: `Informe o número (ou S/N)${addressNumber ? '' : cardNote}.` };
  }
  if (city && (city.length < 2 || city.length > 80 || UNSAFE_RE.test(city))) return { ok: false, field: 'city', error: 'Cidade inválida.' };
  if (state && !STATE_CODES.has(state)) return { ok: false, field: 'state', error: 'Estado inválido.' };

  return {
    ok: true,
    data: {
      first_name: base.data.first_name,
      last_name: base.data.last_name,
      email: base.data.email,
      phone: phone || null,
      postal_code: postalCode || null,
      street: street || null,
      address_number: addressNumber || null,
      city: city || null,
      state: state || null,
    },
  };
}

export type CardField = 'number' | 'holderName' | 'expiry' | 'ccv' | 'cpfCnpj';

export type CardInput = Partial<Record<CardField, unknown>>;

export type CardClean = {
  number: string;
  holderName: string;
  expiryMonth: string;
  expiryYear: string;
  ccv: string;
  cpfCnpj: string;
};

/** Devolve os dados do cartão limpos ou o primeiro campo inválido, com mensagem em português. */
export function validateCard(input: CardInput, now = new Date()): { ok: true; data: CardClean } | { ok: false; field: CardField; error: string } {
  const number = onlyDigits(input.number);
  const holderName = typeof input.holderName === 'string' ? input.holderName.replace(/\s+/g, ' ').trim().slice(0, 100) : '';
  const [mm, yy] = typeof input.expiry === 'string' ? input.expiry.split('/').map((p) => p.trim()) : [];
  const ccv = onlyDigits(input.ccv);
  const cpfCnpj = onlyDigits(input.cpfCnpj);

  if (number.length < 13 || number.length > 19 || !luhn(number)) return { ok: false, field: 'number', error: 'Confira o número do cartão.' };
  if (holderName.length < 3 || !/^[\p{L} '.-]+$/u.test(holderName)) return { ok: false, field: 'holderName', error: 'Informe o nome como está no cartão.' };
  const month = Number(mm);
  const year = yy && yy.length === 2 ? 2000 + Number(yy) : Number(yy);
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  if (!(month >= 1 && month <= 12) || !Number.isFinite(year) || expired || year > now.getFullYear() + 20) {
    return { ok: false, field: 'expiry', error: 'Validade inválida (MM/AA).' };
  }
  if (!/^\d{3,4}$/.test(ccv)) return { ok: false, field: 'ccv', error: 'CVV inválido.' };
  if (!isValidCpfCnpj(cpfCnpj)) return { ok: false, field: 'cpfCnpj', error: 'CPF ou CNPJ inválido.' };

  return { ok: true, data: { number, holderName, expiryMonth: String(month).padStart(2, '0'), expiryYear: String(year), ccv, cpfCnpj } };
}
