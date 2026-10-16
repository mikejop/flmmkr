import 'server-only';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { asaasService } from '@/services/asaas';
import { evaluateRefundEligibility, confirmationDate, productKeyFromDescription } from '@/services/refundEligibility';
import { refundDeadline } from '@/utils/refundWindow';

export type PurchaseStatus = 'active' | 'refunded' | 'refund_review' | 'refund_processing';

export interface PurchaseView {
  paymentId: string;
  productName: string;
  /** ISO do instante de confirmação (meia-noite de São Paulo da data confirmada). */
  purchasedAt: string | null;
  amount: number;
  billingType: 'CREDIT_CARD' | 'PIX' | 'BOLETO' | 'OTHER';
  installments: number | null;
  status: PurchaseStatus;
  /** ISO do fim do prazo (23:59:59 de São Paulo). */
  refundDeadline: string | null;
  refundOpen: boolean;
  receiptUrl: string | null;
  /** Boleto: link para o pagador informar os dados bancários do estorno. */
  bankSlipRefundUrl: string | null;
}

const PAID = new Set(['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH']);

function normalizeBilling(value?: string): PurchaseView['billingType'] {
  return value === 'CREDIT_CARD' || value === 'PIX' || value === 'BOLETO' ? value : 'OTHER';
}

/** IDs de cobrança que pertencem ao aluno (perfil, checkouts confirmados do mesmo e-mail e reembolsos já pedidos). */
export async function getUserPaymentIds(userId: string): Promise<{ ids: string[]; customerId: string | null; email: string | null }> {
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('email, asaas_payment_id, asaas_customer_id')
    .eq('id', userId)
    .maybeSingle();
  const ids = new Set<string>();
  if (profile?.asaas_payment_id) ids.add(profile.asaas_payment_id);

  if (profile?.email) {
    const { data: checkouts } = await supabaseAdmin
      .from('pending_checkouts')
      .select('payment_id')
      .eq('email', profile.email.toLowerCase())
      .in('status', ['CONFIRMED', 'RECEIVED'])
      .limit(10);
    (checkouts || []).forEach((c) => c.payment_id && ids.add(c.payment_id));
  }
  const { data: refunds } = await supabaseAdmin.from('refund_requests').select('asaas_payment_id').eq('user_id', userId).limit(10);
  (refunds || []).forEach((r) => ids.add(r.asaas_payment_id));

  return { ids: Array.from(ids).slice(0, 10), customerId: profile?.asaas_customer_id ?? null, email: profile?.email ?? null };
}

/** Compras do aluno para a aba "Compras & Acesso". Datas e elegibilidade calculadas aqui, no servidor. */
export async function getUserPurchases(userId: string, now: Date = new Date()): Promise<PurchaseView[]> {
  const { ids, customerId } = await getUserPaymentIds(userId);
  if (ids.length === 0) return [];

  const { data: refundRows } = await supabaseAdmin
    .from('refund_requests')
    .select('asaas_payment_id, status, bank_slip_refund_url')
    .in('asaas_payment_id', ids);
  const refundByPayment = new Map((refundRows || []).map((r) => [r.asaas_payment_id, r]));

  const views: PurchaseView[] = [];
  for (const id of ids) {
    try {
      const payment = await asaasService.getPayment(id);
      // Cobrança de outro cliente nunca aparece (confere o dono quando o perfil tem o cliente do Asaas).
      if (customerId && payment.customer && payment.customer !== customerId) continue;

      const refund = refundByPayment.get(id);
      const refundedAtAsaas = payment.status === 'REFUNDED';
      if (!PAID.has(payment.status) && !refund && !refundedAtAsaas) continue; // ainda não é uma compra

      let amount = payment.value ?? 0;
      let installments: number | null = null;
      if (payment.installment) {
        try {
          const installment = await asaasService.getInstallment(payment.installment);
          amount = installment.value ?? amount;
          installments = installment.installmentCount ?? null;
        } catch { /* mantém o valor da parcela */ }
      }

      const confirmed = confirmationDate(payment);
      const deadline = confirmed ? refundDeadline(confirmed) : null;
      const eligibility = evaluateRefundEligibility(payment, { hasExistingRefund: !!refund, now });

      let status: PurchaseStatus = 'active';
      if (refund?.status === 'completed' || refundedAtAsaas) status = 'refunded';
      else if (refund?.status === 'manual_review' || refund?.status === 'failed') status = 'refund_review';
      else if (refund) status = 'refund_processing';

      views.push({
        paymentId: id,
        productName: (payment.description || 'Color Master').slice(0, 120),
        purchasedAt: confirmed ? new Date(`${confirmed.slice(0, 10)}T00:00:00-03:00`).toISOString() : null,
        amount,
        billingType: normalizeBilling(payment.billingType),
        installments,
        status,
        refundDeadline: deadline ? deadline.toISOString() : null,
        refundOpen: eligibility.ok,
        receiptUrl: payment.transactionReceiptUrl || payment.invoiceUrl || null,
        bankSlipRefundUrl: refund?.bank_slip_refund_url ?? null,
      });
    } catch (err) {
      console.error('[purchases] falha ao consultar cobrança', id, err instanceof Error ? err.message : err);
    }
  }
  return views.sort((a, b) => (b.purchasedAt || '').localeCompare(a.purchasedAt || ''));
}

export { productKeyFromDescription };
