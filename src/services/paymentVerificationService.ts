/**
 * Payment Verification Service (Zero-Trust Dual Check: Asaas + Supabase)
 * Regra: Só pode acessar a área do aluno se o status estiver pago no servidor e no Asaas.
 * Na hora de liberar, pergunta para o Asaas se está pago e depois para o servidor, comparando os dois.
 * Se no servidor estiver como pago e no Asaas não, o servidor é atualizado com não pago e o usuário é bloqueado.
 * Se ambos estiverem pagos, o acesso é concedido.
 */

import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';

export interface PaymentVerificationResult {
  isAllowed: boolean;
  status: string;
  reason?: string;
  asaasPaymentId?: string;
}

const PAID_ASAAS_STATUSES = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];

export async function verifyAndSyncPaymentAccess({
  userId,
  email,
  paymentId
}: {
  userId?: string;
  email?: string;
  paymentId?: string;
}): Promise<PaymentVerificationResult> {
  try {
    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Consultar dados do Servidor (Supabase)
    let profileQuery = supabaseAdmin.from('profiles').select('*');
    if (userId) {
      profileQuery = profileQuery.eq('id', userId);
    } else if (normalizedEmail) {
      profileQuery = profileQuery.eq('email', normalizedEmail);
    } else if (paymentId) {
      profileQuery = profileQuery.eq('asaas_payment_id', paymentId);
    } else {
      return {
        isAllowed: false,
        status: 'UNKNOWN',
        reason: 'Identificador de usuário ou pagamento não fornecido.'
      };
    }

    const { data: profile } = await profileQuery.maybeSingle();

    // Buscar também na tabela de checkouts
    let checkoutQuery = supabaseAdmin.from('pending_checkouts').select('*');
    if (paymentId) {
      checkoutQuery = checkoutQuery.eq('payment_id', paymentId);
    } else if (normalizedEmail) {
      checkoutQuery = checkoutQuery.eq('email', normalizedEmail).order('created_at', { ascending: false });
    }
    const { data: checkouts } = await checkoutQuery.limit(1);
    const checkout = checkouts?.[0];

    const asaasPaymentId = profile?.asaas_payment_id || checkout?.payment_id || paymentId;

    if (!asaasPaymentId) {
      // Se for admin explicitamente configurado no perfil, permitir acesso
      if (profile?.role === 'admin') {
        return { isAllowed: true, status: 'ADMIN_BYPASS' };
      }
      return {
        isAllowed: false,
        status: 'NO_PAYMENT_FOUND',
        reason: 'Nenhuma transação financeira vinculada a este usuário.'
      };
    }

    // 2. Consultar o Asaas diretamente via API
    let asaasPayment: any = null;
    try {
      asaasPayment = await asaasService.getPaymentStatus(asaasPaymentId);
    } catch (asaasErr: any) {
      console.error('[Payment Verification] Cobrança não encontrada ou erro no Asaas:', asaasErr?.message || asaasErr);
      return {
        isAllowed: false,
        status: 'ASAAS_NOT_FOUND',
        reason: 'Cobrança não localizada na base do Asaas.'
      };
    }

    const asaasStatus = asaasPayment?.status;
    const isAsaasPaid = PAID_ASAAS_STATUSES.includes(asaasStatus);

    // 3. Regra de Comparação:
    // Se no servidor estiver como pago e no Asaas não, rebaixa o servidor para não pago e bloqueia
    if (!isAsaasPaid) {
      if (profile?.id) {
        await supabaseAdmin
          .from('profiles')
          .update({
            has_access: false,
            payment_status: asaasStatus || 'UNPAID',
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
      }

      if (asaasPaymentId) {
        await supabaseAdmin
          .from('pending_checkouts')
          .update({
            status: asaasStatus || 'UNPAID',
            updated_at: new Date().toISOString()
          })
          .eq('payment_id', asaasPaymentId);
      }

      return {
        isAllowed: false,
        status: asaasStatus || 'UNPAID',
        asaasPaymentId,
        reason: `Status no Asaas é "${asaasStatus}" (não confirmado). Acesso negado.`
      };
    }

    // Se no Asaas está PAGO:
    // Sincroniza o servidor garantindo que has_access está true e status CONFIRMED
    if (profile?.id && (!profile.has_access || profile.payment_status !== 'CONFIRMED')) {
      await supabaseAdmin
        .from('profiles')
        .update({
          has_access: true,
          payment_status: 'CONFIRMED',
          asaas_payment_id: asaasPaymentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);
    }

    if (asaasPaymentId && checkout && checkout.status !== 'CONFIRMED') {
      await supabaseAdmin
        .from('pending_checkouts')
        .update({
          status: 'CONFIRMED',
          updated_at: new Date().toISOString()
        })
        .eq('payment_id', asaasPaymentId);
    }

    return {
      isAllowed: true,
      status: 'CONFIRMED',
      asaasPaymentId
    };
  } catch (error: any) {
    console.error('[Payment Verification Exception]:', error);
    return {
      isAllowed: false,
      status: 'ERROR',
      reason: error?.message || 'Falha ao validar status duplo de pagamento.'
    };
  }
}
