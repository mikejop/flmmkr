import 'server-only';
import { asaasService } from '@/services/asaas';

const PAID_STATUSES = new Set(['RECEIVED', 'CONFIRMED']);

/** Menor e maior valor total aceitos para uma cobrança sem pedido pendente (preço do Produto até o Completo, com folga de juros). */
const MIN_PAID_TOTAL = 95;
const MAX_PAID_TOTAL = 650;

type AsaasPaymentData = Awaited<ReturnType<typeof asaasService.getPaymentStatus>>;

export type PaymentVerification =
  | { ok: true; amount: number; payment: AsaasPaymentData }
  | { ok: false; reason: string };

/**
 * Reconsulta a cobrança no Asaas (GET /v3/payments/{id}, com a chave do servidor) e só aprova quando:
 *  - o status é RECEIVED ou CONFIRMED (e a cobrança não foi apagada);
 *  - o valor bate com o pedido (ou, sem pedido, fica numa faixa que não deixa um produto mais barato liberar o curso);
 *  - o externalReference bate com o do pedido.
 * O conteúdo do evento recebido no webhook nunca é usado para decidir.
 */
export async function verifyPaidPayment(
  paymentId: string,
  expected: { amount?: number | null; externalReference?: string | null } = {},
): Promise<PaymentVerification> {
  let payment;
  try {
    payment = await asaasService.getPaymentStatus(paymentId);
  } catch {
    return { ok: false, reason: 'asaas_lookup_failed' };
  }

  if (payment.id !== paymentId) return { ok: false, reason: 'payment_id_mismatch' };
  if (payment.deleted) return { ok: false, reason: 'payment_deleted' };
  if (!PAID_STATUSES.has(payment.status)) return { ok: false, reason: `status_${payment.status}` };

  const value = Number(payment.value);
  if (!Number.isFinite(value) || value <= 0) return { ok: false, reason: 'invalid_value' };

  if (expected.amount != null && Number.isFinite(Number(expected.amount))) {
    if (Math.abs(value - Number(expected.amount)) > 0.01) return { ok: false, reason: 'amount_mismatch' };
  } else if (!payment.installment && (value < MIN_PAID_TOTAL || value > MAX_PAID_TOTAL)) {
    return { ok: false, reason: 'amount_out_of_range' };
  }

  if (expected.externalReference && payment.externalReference !== expected.externalReference) {
    return { ok: false, reason: 'external_reference_mismatch' };
  }

  return { ok: true, amount: value, payment };
}
