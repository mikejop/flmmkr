import { isRefundWindowOpen, refundDeadline } from '../utils/refundWindow.ts';

/** Só o que a decisão precisa do pagamento do Asaas (facilita testar sem rede). */
export interface EligibilityPayment {
  status: string;
  deleted?: boolean;
  chargeback?: { status?: string } | null;
  confirmedDate?: string | null;
  paymentDate?: string | null;
  clientPaymentDate?: string | null;
}

export type IneligibleReason =
  | 'status'
  | 'deleted'
  | 'chargeback'
  | 'already_requested'
  | 'no_confirmation_date'
  | 'window_closed';

/** Data civil da confirmação do pagamento: a primeira disponível entre as datas do Asaas. */
export function confirmationDate(payment: EligibilityPayment): string | null {
  return payment.confirmedDate || payment.paymentDate || payment.clientPaymentDate || null;
}

/**
 * Elegibilidade para reembolso. Todas as condições são checadas no servidor com dados do Asaas:
 * pago (RECEIVED ou CONFIRMED), não removido, sem chargeback, sem pedido anterior e dentro dos 7 dias.
 */
export function evaluateRefundEligibility(
  payment: EligibilityPayment,
  opts: { hasExistingRefund: boolean; now?: Date }
): { ok: true; deadline: Date; confirmedOn: string } | { ok: false; reason: IneligibleReason } {
  if (opts.hasExistingRefund) return { ok: false, reason: 'already_requested' };
  if (payment.deleted) return { ok: false, reason: 'deleted' };
  if (payment.status.startsWith('CHARGEBACK') || payment.status === 'AWAITING_CHARGEBACK_REVERSAL' || payment.chargeback?.status) {
    return { ok: false, reason: 'chargeback' };
  }
  if (payment.status !== 'RECEIVED' && payment.status !== 'CONFIRMED') return { ok: false, reason: 'status' };

  const confirmedOn = confirmationDate(payment);
  if (!confirmedOn) return { ok: false, reason: 'no_confirmation_date' };
  const deadline = refundDeadline(confirmedOn);
  if (!deadline || !isRefundWindowOpen(confirmedOn, opts.now)) return { ok: false, reason: 'window_closed' };
  return { ok: true, deadline, confirmedOn };
}

/** Chave do produto a partir da descrição da cobrança (usada no limite de 1 reembolso por CPF e produto). */
export function productKeyFromDescription(description: string | null | undefined): string {
  return /completo/i.test(description || '') ? 'color-master-completo' : 'color-master-produto';
}

/** Endpoint de estorno do Asaas conforme a forma de pagamento. */
export type RefundEndpoint = 'installment' | 'bank_slip' | 'payment';
export function refundEndpointFor(payment: { billingType?: string; installment?: string | null }): RefundEndpoint {
  if (payment.installment) return 'installment'; // cartão parcelado: estorna o parcelamento inteiro
  if (payment.billingType === 'BOLETO') return 'bank_slip';
  return 'payment'; // cartão à vista ou Pix
}
