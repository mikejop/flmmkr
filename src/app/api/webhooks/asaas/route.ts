import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { getServerSecret } from '@/utils/serverSecrets';

export async function POST(req: NextRequest) {
  let processingEventKey: string | null = null;
  try {
    // 1. Validar o token obrigatório do webhook.
    const expectedToken = await getServerSecret('asaasWebhookSecret');
    const receivedToken = req.headers.get('asaas-access-token');

    const expectedBytes = Buffer.from(expectedToken || '');
    const receivedBytes = Buffer.from(receivedToken || '');
    if (!expectedToken || expectedBytes.length !== receivedBytes.length || !timingSafeEqual(expectedBytes, receivedBytes)) {
      return NextResponse.json({ error: 'Token de autenticação inválido.' }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload?.event;
    const payment = payload?.payment;

    if (!event || !payment?.id) return NextResponse.json({ error: 'Evento ou pagamento inválido.' }, { status: 400 });

    const isPaidEvent = event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED';
    let eventKey = String(payload?.id || `${event}:${payment.id}`);
    if (isPaidEvent) eventKey = `paid:${payment.id}`;
    processingEventKey = isPaidEvent ? eventKey : null;

    if (isPaidEvent) {
      const { supabaseAdmin } = await import('@/utils/supabase/admin');
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('payment_events')
        .insert({
          provider_event_id: eventKey,
          provider_payment_id: String(payment.id),
          event_type: event,
          processing_status: 'processing',
          // Store only the minimum webhook fields needed for an audit trail;
          // do not persist the provider's full payload or payer/card metadata.
          payload: {
            event,
            payment: {
              id: String(payment.id),
              status: typeof payment.status === 'string' ? payment.status : null,
              billingType: typeof payment.billingType === 'string' ? payment.billingType : null,
              value: typeof payment.value === 'number' ? payment.value : null,
            },
          },
        })
        .select('id')
        .maybeSingle();

      if (insertError) {
        // A unique conflict means another delivery already owns or completed this payment.
        if (insertError.code === '23505') {
          const { data: previous } = await supabaseAdmin
            .from('payment_events').select('id, processing_status')
            .eq('provider_event_id', eventKey).maybeSingle();
          if (previous?.processing_status === 'failed') {
            const { data: retry } = await supabaseAdmin
              .from('payment_events').update({ processing_status: 'processing', last_error: null })
              .eq('id', previous.id).eq('processing_status', 'failed').select('id').maybeSingle();
            if (!retry) return NextResponse.json({ received: true, duplicate: true });
          } else {
            return NextResponse.json({ received: true, duplicate: true });
          }
        } else {
          throw insertError;
        }
      } else if (!inserted) {
        throw new Error('Não foi possível registrar o evento de pagamento.');
      }
    }

    // Tratamento dos eventos principais
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Pagamento aprovado -> Liberar acesso do aluno e criar perfil no Supabase
        if (payment?.id) {
          try {
            const { supabaseAdmin } = await import('@/utils/supabase/admin');
            const { provisionSupabaseUserAndProfile } = await import('@/services/userService');


            const { data: pending, error: pendingError } = await supabaseAdmin
              .from('pending_checkouts')
              .select('*')
              .eq('payment_id', payment.id)
              .maybeSingle();
            if (pendingError) throw pendingError;

            if (pending && pending.status !== 'CONFIRMED') {
              await provisionSupabaseUserAndProfile({
                email: pending.email,
                name: pending.full_name,
                phone: pending.phone,
                age: pending.age,
                profession: pending.profession,
                address: pending.address,
                asaasCustomerId: pending.asaas_customer_id,
                asaasPaymentId: payment.id
              });

              const { error: checkoutUpdateError } = await supabaseAdmin
                .from('pending_checkouts')
                .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
                .eq('payment_id', payment.id);
              if (checkoutUpdateError) throw checkoutUpdateError;
            } else if (!pending && payment?.customer) {
              // Pagamento realizado via link direto do Asaas (fora do pending_checkouts)
              const { asaasService } = await import('@/services/asaas');
              const customer = await asaasService.getCustomer(payment.customer);
              if (customer && customer.email) {
                await provisionSupabaseUserAndProfile({
                  email: customer.email,
                  name: customer.name || 'Aluno FLMMKR',
                  phone: customer.mobilePhone || customer.phone || undefined,
                  address: customer.address ? {
                    street: customer.address,
                    number: customer.addressNumber,
                    complement: customer.complement,
                    neighborhood: customer.province,
                    city: customer.cityName,
                    state: customer.state,
                    postalCode: customer.postalCode
                  } : null,
                  asaasCustomerId: customer.id,
                  asaasPaymentId: payment.id
                });
              } else {
                throw new Error('Não foi possível localizar o pagador associado ao pagamento.');
              }
            } else if (!pending) {
              throw new Error('Checkout pendente não encontrado e o pagamento não possui cliente associado.');
            }
          } catch (provErr) {
        console.error('[Asaas Webhook Provisioning Error]:', provErr instanceof Error ? provErr.message : 'Falha no provisionamento');
            throw provErr;
          }
        }

        {
          const { supabaseAdmin } = await import('@/utils/supabase/admin');
          await supabaseAdmin.from('payment_events').update({
            processing_status: 'processed',
            processed_at: new Date().toISOString(),
          }).eq('provider_event_id', eventKey);
        }
        break;

      case 'PAYMENT_OVERDUE':
      case 'PAYMENT_REFUNDED':
      case 'PAYMENT_PARTIALLY_REFUNDED':
      case 'PAYMENT_CHARGEBACK_REQUESTED':
      case 'PAYMENT_CHARGEBACK_DISPUTE':
      case 'PAYMENT_DELETED': {
        // Reversão/cancelamento precisa retirar acesso no perfil e nas sessões
        // antes de responder ao webhook. Repetir o evento mantém o mesmo estado.
        const { supabaseAdmin } = await import('@/utils/supabase/admin');
        const status = String(payment.status || event.replace('PAYMENT_', ''));
        const { data: profile, error: profileLookupError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('asaas_payment_id', String(payment.id))
          .maybeSingle();
        if (profileLookupError) throw profileLookupError;

        const { error: checkoutError } = await supabaseAdmin
          .from('pending_checkouts')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('payment_id', String(payment.id));
        if (checkoutError) throw checkoutError;

        if (profile?.id) {
          const { error: revokeError } = await supabaseAdmin
            .from('profiles')
            .update({ has_access: false, payment_status: status, updated_at: new Date().toISOString() })
            .eq('id', profile.id);
          if (revokeError) throw revokeError;
          const { invalidateAccessCache } = await import('@/services/paymentVerificationService');
          invalidateAccessCache(profile.id);

          const { error: sessionsError } = await supabaseAdmin
            .from('user_active_sessions')
            .update({ is_active: false, replaced_at: new Date().toISOString() })
            .eq('user_id', profile.id)
            .eq('is_active', true);
          if (sessionsError) throw sessionsError;
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    if (processingEventKey) {
      try {
        const { supabaseAdmin } = await import('@/utils/supabase/admin');
        await supabaseAdmin.from('payment_events').update({
          processing_status: 'failed',
          last_error: error instanceof Error ? error.message.slice(0, 500) : 'Falha no processamento',
        }).eq('provider_event_id', processingEventKey).eq('processing_status', 'processing');
      } catch {}
    }
    console.error('[Asaas Webhook Error]:', 'Falha no processamento');
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
