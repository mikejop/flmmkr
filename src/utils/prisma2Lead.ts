/** Validação do cadastro de download do PRISMA 2. Usada no navegador (feedback) e no servidor (a validação que vale). */

export const BR_STATES = [
  ['AC', 'Acre'], ['AL', 'Alagoas'], ['AP', 'Amapá'], ['AM', 'Amazonas'], ['BA', 'Bahia'], ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'], ['ES', 'Espírito Santo'], ['GO', 'Goiás'], ['MA', 'Maranhão'], ['MT', 'Mato Grosso'],
  ['MS', 'Mato Grosso do Sul'], ['MG', 'Minas Gerais'], ['PA', 'Pará'], ['PB', 'Paraíba'], ['PR', 'Paraná'],
  ['PE', 'Pernambuco'], ['PI', 'Piauí'], ['RJ', 'Rio de Janeiro'], ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'], ['RO', 'Rondônia'], ['RR', 'Roraima'], ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'], ['SE', 'Sergipe'], ['TO', 'Tocantins'],
] as const;

const STATE_CODES = new Set<string>(BR_STATES.map(([code]) => code));

/** Máscara (11) 91234-5678 / (11) 1234-5678 a partir de qualquer texto. */
export function maskPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : '';
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export type Prisma2LeadInput = {
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  state: string;
  city: string;
};

export type Prisma2LeadClean = {
  first_name: string;
  last_name: string;
  company: string | null;
  email: string;
  phone: string;
  state: string;
  city: string;
};

const NAME_RE = /^[\p{L}][\p{L}\p{M} '.-]*$/u;
const CITY_RE = /^[\p{L}\p{M}0-9][\p{L}\p{M}0-9 '.()\/-]*$/u;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// Barra o texto livre que não é nome de pessoa/empresa: marcas de HTML e caracteres de controle.
const UNSAFE_RE = /[<>{}`\\\u0000-\u001f\u007f]/;

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.normalize('NFC').replace(/\s+/g, ' ').trim().slice(0, max + 1) : '');

/** Devolve o cadastro limpo ou a mensagem do primeiro campo inválido. */
export function validatePrisma2Lead(input: Partial<Record<keyof Prisma2LeadInput, unknown>>): { ok: true; data: Prisma2LeadClean } | { ok: false; error: string } {
  const firstName = clean(input.firstName, 60);
  const lastName = clean(input.lastName, 80);
  const company = clean(input.company, 120);
  const email = clean(input.email, 254).toLowerCase();
  const phone = typeof input.phone === 'string' ? input.phone.replace(/\D/g, '') : '';
  const state = clean(input.state, 2).toUpperCase();
  const city = clean(input.city, 80);

  if (!firstName || firstName.length > 60 || !NAME_RE.test(firstName) || UNSAFE_RE.test(firstName)) return { ok: false, error: 'Informe seu nome.' };
  if (!lastName || lastName.length > 80 || !NAME_RE.test(lastName) || UNSAFE_RE.test(lastName)) return { ok: false, error: 'Informe seu sobrenome.' };
  if (company && (company.length > 120 || UNSAFE_RE.test(company))) return { ok: false, error: 'O nome da empresa é inválido.' };
  if (email.length < 5 || email.length > 254 || !EMAIL_RE.test(email)) return { ok: false, error: 'Informe um e-mail válido.' };
  if (!/^[1-9]{2}9?[0-9]{8}$/.test(phone)) return { ok: false, error: 'Informe um telefone com DDD.' };
  if (!STATE_CODES.has(state)) return { ok: false, error: 'Selecione o estado.' };
  if (city.length < 2 || city.length > 80 || !CITY_RE.test(city)) return { ok: false, error: 'Informe sua cidade.' };

  return { ok: true, data: { first_name: firstName, last_name: lastName, company: company || null, email, phone, state, city } };
}
