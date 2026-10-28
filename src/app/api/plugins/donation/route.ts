import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { getClientIp } from '@/utils/clientIp';
import { consumeRateLimit, consumeKeyRateLimit, readJsonLimited } from '@/utils/rateLimit';
import { verifyTurnstile } from '@/utils/turnstile';
import { isProductionRuntime } from '@/utils/runtimeEnv';
import { hashClientIp } from '@/utils/ipHash';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { amountError, parseAmount, validateCard, validateDonor, DONATION_DESCRIPTION, DONATION_REF_PREFIX, type DonorClean } from '@/utils/donation';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const json = (body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) =>
  NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });

const PIX_EXPIRATION_SECONDS = 30 * 60;
const PAID = new Set(['RECEIVED', 'CONFIRMED']);
const REF_RE = new RegExp(`^${DONATION_REF_PREFIX}[0-9a-f-]{36}$`);
const TABLE = 'flmmkr-plugins-donations';

type DonationStatus = 'pending' | 'paid' | 'refused';

/** Registra a doação. Falha ao gravar não derruba o pagamento: só fica no log. */
async function recordDonation(row: DonorClean & { reference: string; method: 'pix' | 'card'; amount: number; status: DonationStatus; asaas_payment_id?: string | null; ip_hash: string | null; marketing_opt_in: boolean }) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .insert({ ...row, marketing_opt_in_at: row.marketing_opt_in ? new Date().toISOString() : null });
  if (error) console.error('[donation] falha ao gravar doação:', error.code, error.message);
}

async function markDonation(reference: string, status: DonationStatus, asaasPaymentId?: string) {
  const { error } = await supabaseAdmin
    .from(TABLE)
    .update({ status, ...(asaasPaymentId ? { asaas_payment_id: asaasPaymentId } : {}), updated_at: new Date().toISOString() })
    .eq('reference', reference)
    .neq('status', status);
  if (error) console.error('[donation] falha ao atualizar doação:', error.code, error.message);
}

/** Rate limit fora de produção pode faltar (sem Redis local): segue sem limite. Em produção, recusa. */
function rateLimitUnavailable(): NextResponse | null {
  if (isProductionRuntime()) {
    console.error('[donation] rate limit indisponível em produção: doação recusada.');
    return json({ error: 'Doação temporariamente indisponível. Tente novamente em instantes.' }, 503);
  }
  return null;
}

/** Cria a doação: Pix (QR Code com o valor) ou cartão de crédito. */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (!origin || new URL(req.url).origin !== origin) return json({ error: 'Requisição inválida.' }, 403);

  const body = await readJsonLimited(req, 4096);
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Requisição inválida.' }, 400);
  const input = body as Record<string, unknown>;

  const amount = parseAmount(input.amount);
  const invalidAmount = amountError(amount);
  if (invalidAmount) return json({ error: invalidAmount, field: 'amount' }, 400);

  if (input.method !== 'pix' && input.method !== 'card') return json({ error: 'Forma de pagamento inválida.' }, 400);
  const donorCheck = validateDonor((input.donor ?? {}) as Record<string, unknown>, input.method === 'card');
  if (!donorCheck.ok) return json({ error: donorCheck.error, field: donorCheck.field }, 400);
  const donor = donorCheck.data;
  // Consentimento (LGPD) para notificações e e-mail marketing: só vale marcado explicitamente.
  const marketingOptIn = input.marketingOptIn === true;

  const ip = getClientIp(req);
  const ipHash = hashClientIp(ip);
  const externalReference = `${DONATION_REF_PREFIX}${randomUUID()}`;
  const description = DONATION_DESCRIPTION;

  if (input.method === 'pix') {
    const allowed = await consumeRateLimit(req, 'donation:pix:ip', 10, 900);
    if (allowed === null) {
      const refused = rateLimitUnavailable();
      if (refused) return refused;
    } else if (!allowed) {
      return json({ error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' }, 429, { 'Retry-After': '900' });
    }
    try {
      const addressKey = await asaasService.getActivePixAddressKey();
      if (!addressKey) throw new Error('Nenhuma chave Pix ativa no Asaas.');
      const qr = await asaasService.createStaticPixQrCode({ addressKey, value: amount, description, externalReference, expirationSeconds: PIX_EXPIRATION_SECONDS });
      await recordDonation({ ...donor, reference: externalReference, method: 'pix', amount, status: 'pending', ip_hash: ipHash, marketing_opt_in: marketingOptIn });
      return json({ ok: true, ref: externalReference, image: qr.encodedImage, payload: qr.payload, expiresAt: qr.expirationDate ?? null, amount });
    } catch (err) {
      console.error('[donation] falha ao gerar o Pix:', err instanceof Error ? err.message : err);
      return json({ error: 'Não foi possível gerar o Pix agora. Tente novamente em instantes.' }, 502);
    }
  }

  if (input.method === 'card') {
    const parsed = validateCard((input.card ?? {}) as Record<string, unknown>);
    if (!parsed.ok) return json({ error: parsed.error, field: parsed.field }, 400);
    const card = parsed.data;

    const turnstile = await verifyTurnstile(input.turnstileToken, ip);
    if (!turnstile.ok) {
      if (turnstile.reason === 'misconfigured') return json({ error: 'Doação temporariamente indisponível. Tente novamente em instantes.' }, 503);
      return json({ error: 'Não foi possível validar a verificação de segurança. Atualize a página e tente de novo.' }, 403);
    }

    // Limite apertado: formulário de doação com valor baixo é alvo de teste de cartão roubado.
    const [ipAllowed, docAllowed] = await Promise.all([
      consumeRateLimit(req, 'donation:card:ip', 3, 3600),
      consumeKeyRateLimit(card.cpfCnpj, 'donation:card:doc', 3, 3600),
    ]);
    if (ipAllowed === null || docAllowed === null) {
      const refused = rateLimitUnavailable();
      if (refused) return refused;
    }
    if (ipAllowed === false || docAllowed === false) {
      return json({ error: 'Muitas tentativas. Aguarde um pouco e tente novamente.' }, 429, { 'Retry-After': '3600' });
    }

    try {
      // No cartão, telefone, CEP e número já foram exigidos em validateDonor.
      const phone = donor.phone ?? '';
      const postalCode = donor.postal_code ?? '';
      const addressNumber = donor.address_number ?? 'S/N';
      const customer = await asaasService.findOrCreateCustomer({
        name: `${donor.first_name} ${donor.last_name}`,
        cpfCnpj: card.cpfCnpj,
        email: donor.email,
        phone,
        postalCode,
        address: donor.street ?? undefined,
        addressNumber,
      });
      const payment = await asaasService.createPayment({
        customer: customer.id,
        billingType: 'CREDIT_CARD',
        value: amount,
        dueDate: new Date().toISOString().slice(0, 10),
        description,
        externalReference,
        creditCard: { holderName: card.holderName, number: card.number, expiryMonth: card.expiryMonth, expiryYear: card.expiryYear, ccv: card.ccv },
        creditCardHolderInfo: {
          name: card.holderName,
          email: donor.email,
          cpfCnpj: card.cpfCnpj,
          postalCode,
          addressNumber,
          phone,
        },
        remoteIp: ip ?? undefined,
      });
      const paid = PAID.has(payment.status);
      await recordDonation({ ...donor, reference: externalReference, method: 'card', amount, status: paid ? 'paid' : 'refused', asaas_payment_id: payment.id ?? null, ip_hash: ipHash, marketing_opt_in: marketingOptIn });
      if (paid) return json({ ok: true, amount });
      const reason = payment.errors?.[0]?.description || payment.refusalReason;
      return json({ error: reason ? `Pagamento não aprovado: ${reason}` : 'Pagamento não aprovado pela operadora do cartão.' }, 402);
    } catch (err) {
      // O Asaas devolve o motivo da recusa na mensagem de erro (cartão recusado, dados inválidos etc.).
      const reason = err instanceof Error ? err.message : '';
      console.warn('[donation] cartão não aprovado:', reason);
      await recordDonation({ ...donor, reference: externalReference, method: 'card', amount, status: 'refused', ip_hash: ipHash, marketing_opt_in: marketingOptIn });
      return json({ error: reason ? `Pagamento não aprovado: ${reason}` : 'Pagamento não aprovado pela operadora do cartão.' }, 402);
    }
  }

  return json({ error: 'Forma de pagamento inválida.' }, 400);
}

/** Status do Pix de uma doação: o navegador consulta enquanto o QR Code está na tela. */
export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get('ref') ?? '';
  if (!REF_RE.test(ref)) return json({ error: 'Referência inválida.' }, 400);
  const allowed = await consumeRateLimit(req, 'donation:status:ip', 240, 900);
  if (allowed === false) return json({ error: 'Muitas consultas.' }, 429);
  try {
    const payments = await asaasService.listPaymentsByExternalReference(ref);
    const paidPayment = payments.find((p) => PAID.has(p.status) && !p.deleted);
    if (paidPayment) await markDonation(ref, 'paid', paidPayment.id);
    return json({ paid: Boolean(paidPayment) });
  } catch {
    return json({ paid: false });
  }
}
