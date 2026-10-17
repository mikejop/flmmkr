import 'server-only';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { asaasService } from '@/services/asaas';
import { evaluateRefundEligibility, productKeyFromDescription, refundEndpointFor, type IneligibleReason } from '@/services/refundEligibility';
import { getUserPaymentIds } from '@/services/purchases';
import { invalidateUserAccess } from '@/utils/accessCache';
import { logAudit } from '@/services/auditLog';
import { sendAdminAlert } from '@/services/emailService';
import { hashCpf } from '@/utils/cpfHash';

export type RefundOutcome =
  | { kind: 'processing'; requestId: string; bankSlipRefundUrl?: string | null }
  | { kind: 'manual_review'; requestId: string }
  | { kind: 'failed'; requestId: string }
  | { kind: 'existing'; requestId: string; status: string }
  | { kind: 'ineligible'; reason: IneligibleReason | 'not_owner' | 'lookup_failed' };

export interface RefundRequestInput {
  userId: string;
  paymentId: string;
  reason?: string | null;
  withAccountDeletion?: boolean;
  request?: Request;
}

const REVOKED_STATUS = 'REFUND_REQUESTED';

/** Revoga o acesso no banco e limpa o cache (acesso, tokens DRM e URLs assinadas). */
async function revokeAccess(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ has_access: false, payment_status: REVOKED_STATUS, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw new Error('Falha ao revogar o acesso no banco.');
  if (!(await invalidateUserAccess(userId))) console.error('[refund] cache de acesso não limpo; o TTL de 5 min limita o efeito');
}

/**
 * Fluxo de reembolso (todas as decisões no servidor). Ordem:
 * 1) confere dono e elegibilidade no Asaas  2) limite por CPF  3) registra (idempotente por pagamento)
 * 4) revoga o acesso  5) chama o endpoint certo do Asaas  6) se o Asaas recusar: failed + alerta, acesso continua revogado.
 */
export async function requestRefund(input: RefundRequestInput): Promise<RefundOutcome> {
  const { userId, paymentId, request } = input;
  const reason = input.reason?.trim().slice(0, 500) || null;

  // 1) O pagamento precisa ser do aluno e passar em todas as condições, com dados lidos do Asaas agora.
  const owned = await getUserPaymentIds(userId);
  if (!owned.ids.includes(paymentId)) {
    await logAudit({ userId, action: 'refund_denied', metadata: { reason: 'not_owner' }, request });
    return { kind: 'ineligible', reason: 'not_owner' };
  }

  let payment;
  try {
    payment = await asaasService.getPayment(paymentId);
  } catch (err) {
    console.error('[refund] consulta ao Asaas falhou:', err instanceof Error ? err.message : err);
    return { kind: 'ineligible', reason: 'lookup_failed' };
  }
  if (owned.customerId && payment.customer && payment.customer !== owned.customerId) {
    await logAudit({ userId, action: 'refund_denied', metadata: { reason: 'not_owner' }, request });
    return { kind: 'ineligible', reason: 'not_owner' };
  }

  const { data: existing } = await supabaseAdmin
    .from('refund_requests').select('id, status').eq('asaas_payment_id', paymentId).maybeSingle();
  const eligibility = evaluateRefundEligibility(payment, { hasExistingRefund: !!existing });
  if (!eligibility.ok) {
    await logAudit({ userId, action: 'refund_denied', metadata: { reason: eligibility.reason, paymentId }, request });
    if (eligibility.reason === 'already_requested' && existing) return { kind: 'existing', requestId: existing.id, status: existing.status };
    return { kind: 'ineligible', reason: eligibility.reason };
  }

  const billingType = payment.billingType === 'CREDIT_CARD' || payment.billingType === 'PIX' || payment.billingType === 'BOLETO'
    ? payment.billingType
    : null;
  if (!billingType) return { kind: 'ineligible', reason: 'status' };

  const productKey = productKeyFromDescription(payment.description);
  let amount = payment.value ?? 0;
  const installmentId = payment.installment || null;
  if (installmentId) {
    try { amount = (await asaasService.getInstallment(installmentId)).value ?? amount; } catch { /* mantém a parcela */ }
  }

  // 2) Limite por CPF: 1 reembolso COMPLETO por CPF e produto; o segundo vai para análise manual.
  let cpfHash: string | null = null;
  if (payment.customer) {
    try {
      const customer = await asaasService.getCustomer(payment.customer);
      cpfHash = hashCpf((customer as { cpfCnpj?: string }).cpfCnpj || '');
    } catch { /* sem CPF não dá para aplicar a regra; segue e registra no log */ }
  }
  let previousForCpf = false;
  if (cpfHash) {
    const { count } = await supabaseAdmin
      .from('refund_requests')
      .select('id', { count: 'exact', head: true })
      .eq('cpf_hash', cpfHash).eq('product_key', productKey).eq('status', 'completed');
    previousForCpf = (count ?? 0) > 0;
  }

  // 3) Registro idempotente: a UNIQUE de asaas_payment_id impede dois pedidos para o mesmo pagamento.
  const baseRow = {
    user_id: userId,
    asaas_payment_id: paymentId,
    asaas_installment_id: installmentId,
    billing_type: billingType,
    amount,
    reason,
    cpf_hash: cpfHash,
    product_key: productKey,
    with_account_deletion: !!input.withAccountDeletion,
  };

  if (previousForCpf) {
    const { data: review, error } = await supabaseAdmin
      .from('refund_requests').insert({ ...baseRow, status: 'manual_review' }).select('id').single();
    if (error || !review) {
      const { data: again } = await supabaseAdmin.from('refund_requests').select('id, status').eq('asaas_payment_id', paymentId).maybeSingle();
      if (again) return { kind: 'existing', requestId: again.id, status: again.status };
      throw new Error('Falha ao registrar o pedido de reembolso.');
    }
    await logAudit({ userId, action: 'refund_manual_review', metadata: { paymentId, productKey, why: 'cpf_already_refunded' }, request });
    await sendAdminAlert({
      subject: 'Reembolso em análise manual (CPF já reembolsado)',
      text: `Pedido ${review.id} (pagamento ${paymentId}) ficou em análise manual: este CPF já teve um reembolso completo do produto ${productKey}.`,
    });
    return { kind: 'manual_review', requestId: review.id };
  }

  const { data: created, error: insertError } = await supabaseAdmin
    .from('refund_requests').insert({ ...baseRow, status: 'pending' }).select('id').single();
  if (insertError || !created) {
    if (insertError?.code === '23505') {
      const { data: again } = await supabaseAdmin.from('refund_requests').select('id, status').eq('asaas_payment_id', paymentId).maybeSingle();
      if (again) return { kind: 'existing', requestId: again.id, status: again.status };
    }
    throw new Error('Falha ao registrar o pedido de reembolso.');
  }

  // 4) Acesso revogado ANTES de falar com o Asaas: mesmo se algo falhar depois, o acesso não volta sozinho.
  await revokeAccess(userId);
  await supabaseAdmin.from('refund_requests').update({ status: 'processing' }).eq('id', created.id);
  await logAudit({ userId, action: 'refund_requested', metadata: { paymentId, billingType, amount, withAccountDeletion: !!input.withAccountDeletion }, request });

  // 5) Endpoint certo conforme a forma de pagamento.
  try {
    const endpoint = refundEndpointFor({ billingType, installment: installmentId });
    let bankSlipRefundUrl: string | null = null;
    if (endpoint === 'installment' && installmentId) {
      await asaasService.refundInstallment(installmentId);
    } else if (endpoint === 'bank_slip') {
      const result = await asaasService.refundBankSlip(paymentId);
      bankSlipRefundUrl = result.requestUrl ?? null;
      if (bankSlipRefundUrl) await supabaseAdmin.from('refund_requests').update({ bank_slip_refund_url: bankSlipRefundUrl }).eq('id', created.id);
    } else {
      await asaasService.refundPayment(paymentId, 'Reembolso solicitado pelo aluno (7 dias)');
    }
    // "completed" só chega pelo webhook PAYMENT_REFUNDED.
    return { kind: 'processing', requestId: created.id, bankSlipRefundUrl };
  } catch (err) {
    // 6) Asaas recusou: failed, acesso segue revogado, admin avisado.
    const message = (err instanceof Error ? err.message : 'erro desconhecido').slice(0, 500);
    console.error('[refund] Asaas recusou o estorno:', message);
    await supabaseAdmin.from('refund_requests').update({ status: 'failed', error: message }).eq('id', created.id);
    await logAudit({ userId, action: 'refund_failed', metadata: { paymentId, requestId: created.id }, request });
    await sendAdminAlert({
      subject: 'Reembolso FALHOU no Asaas (ação manual necessária)',
      text: `Pedido ${created.id}, pagamento ${paymentId} (${billingType}, R$ ${amount.toFixed(2)}). O acesso do aluno já foi revogado. Erro do Asaas: ${message}`,
    });
    return { kind: 'failed', requestId: created.id };
  }
}

/** Marca o reembolso como concluído (chamado pelo webhook PAYMENT_REFUNDED). Devolve o registro, se houver. */
export async function completeRefund(paymentId: string): Promise<{ id: string; user_id: string | null; with_account_deletion: boolean } | null> {
  const { data } = await supabaseAdmin
    .from('refund_requests')
    .update({ status: 'completed', completed_at: new Date().toISOString(), error: null })
    .eq('asaas_payment_id', paymentId)
    .in('status', ['pending', 'processing', 'failed', 'completed'])
    .select('id, user_id, with_account_deletion')
    .maybeSingle();
  if (data) await logAudit({ userId: data.user_id, action: 'refund_completed', metadata: { paymentId, requestId: data.id } });
  return data ?? null;
}

/** Pedido de reembolso que bloqueia nova liberação de acesso (manual_review ainda não revogou nada). */
export async function hasBlockingRefund(paymentId: string): Promise<boolean> {
  const { data } = await supabaseAdmin.from('refund_requests').select('status').eq('asaas_payment_id', paymentId).maybeSingle();
  return !!data && data.status !== 'manual_review';
}
