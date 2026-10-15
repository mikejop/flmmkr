import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { getServerSecret } from '@/utils/serverSecrets';
import { readJsonLimited } from '@/utils/rateLimit';
import { verifyPaidPayment } from '@/services/asaasPaymentVerification';
import { invalidateUserAccess } from '@/utils/accessCache';

export const dynamic = 'force-dynamic';

const MAX_BODY_BYTES = 64 * 1024;

const eventSchema = z
  .object({
    id: z.string().max(120).optional(),
    event: z.string().min(1).max(60),
    payment: z.object({ id: z.string().min(1).max(120) }).passthrough(),
  })
  .passthrough();

const PAID_EVENTS = new Set(['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED']);
// Reversão ou cancelamento: retira o acesso (e repetir o evento mantém o mesmo estado).
const REVERSAL_EVENTS = new Set([
  'PAYMENT_OVERDUE',
  'PAYMENT_REFUNDED',
  'PAYMENT_PARTIALLY_REFUNDED',
  'PAYMENT_CHARGEBACK_REQUESTED',
  'PAYMENT_CHARGEBACK_DISPUTE',
  'PAYMENT_DELETED',
]);

/** Token do webhook: variável ASAAS_WEBHOOK_TOKEN, se existir; senão o segredo guardado no Supabase Vault. */
async function getExpectedToken(): Promise<string> {
  const fromEnv = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  return getServerSecret('asaasWebhookSecret');
}

function tokensMatch(expected: string, received: string): boolean {
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  return expectedBytes.length > 0 && expectedBytes.length === receivedBytes.length && timingSafeEqual(expectedBytes, receivedBytes);
}

export async function POST(req: NextRequest) {
  let trackedEventKey: string | null = null;
  try {
    // 1. Autenticação do webhook (comparação em tempo constante).
    let expectedToken = '';
    try {
      expectedToken = await getExpectedToken();
    } catch {
      console.error('[Asaas Webhook] Token do webhook indisponível.');
    }
    if (!tokensMatch(expectedToken, req.headers.get('asaas-access-token') || '')) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 2. Corpo validado e limitado. Do evento só valem o tipo e o ID do pagamento.
    const body = await readJsonLimited(req, MAX_BODY_BYTES);
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Evento inválido.' }, { status: 400 });
    const { event, payment } = parsed.data;
    const paymentId = payment.id;

    const isPaidEvent = PAID_EVENTS.has(event);
    if (!isPaidEvent && !REVERSAL_EVENTS.has(event)) return NextResponse.json({ received: true });

    // 3. Idempotência: cada evento é registrado uma única vez (provider_event_id é UNIQUE).
    //    PAYMENT_RECEIVED e PAYMENT_CONFIRMED do mesmo pagamento contam como um só.
    const eventKey = isPaidEvent ? `paid:${paymentId}` : `${event}:${paymentId}`;
    const { supabaseAdmin } = await import('@/utils/supabase/admin');
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('payment_events')
      .insert({
        provider_event_id: eventKey,
        provider_payment_id: paymentId,
        event_type: event,
        processing_status: 'processing',
        // Só o mínimo para auditoria; o corpo completo (dados do pagador/cartão) não é guardado.
        payload: { event, payment: { id: paymentId } },
      })
      .select('id')
      .maybeSingle();

    if (insertError) {
      if (insertError.code !== '23505') throw insertError;
      const { data: previous } = await supabaseAdmin
        .from('payment_events').select('id, processing_status')
        .eq('provider_event_id', eventKey).maybeSingle();
      if (previous?.processing_status !== 'failed') return NextResponse.json({ received: true, duplicate: true });
      // Tentativa anterior falhou: reabre (só um entrega consegue reabrir).
      const { data: retry } = await supabaseAdmin
        .from('payment_events').update({ processing_status: 'processing', last_error: null })
        .eq('id', previous.id).eq('processing_status', 'failed').select('id').maybeSingle();
      if (!retry) return NextResponse.json({ received: true, duplicate: true });
    } else if (!inserted) {
      throw new Error('Não foi possível registrar o evento de pagamento.');
    }
    trackedEventKey = eventKey;

    const markEvent = async (status: 'processed' | 'failed', lastError?: string) => {
      await supabaseAdmin.from('payment_events').update({
        processing_status: status,
        processed_at: new Date().toISOString(),
        last_error: lastError ?? null,
      }).eq('provider_event_id', eventKey);
    };

    if (isPaidEvent) {
      // 4. Libera o acesso só depois de reconsultar o pagamento no Asaas (status, valor e referência do pedido).
      const { data: pending, error: pendingError } = await supabaseAdmin
        .from('pending_checkouts')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle();
      if (pendingError) throw pendingError;

      const verification = await verifyPaidPayment(paymentId, {
        amount: pending?.amount ?? null,
        externalReference: pending?.external_reference ?? null,
      });
      if (!verification.ok) {
        // Falha ao falar com o Asaas: responde erro para o Asaas reenviar. Qualquer outro motivo: não libera.
        if (verification.reason === 'asaas_lookup_failed') throw new Error('Consulta ao Asaas indisponível.');
        console.warn('[Asaas Webhook] Pagamento não liberado na reconsulta:', verification.reason);
        await markEvent('failed', `verificação recusada: ${verification.reason}`);
        trackedEventKey = null;
        return NextResponse.json({ received: true, ignored: true });
      }

      const { provisionSupabaseUserAndProfile } = await import('@/services/userService');

      if (pending && pending.status !== 'CONFIRMED') {
        // A conta é criada aqui, no servidor, só depois do pagamento confirmado (se já existir, só libera o acesso).
        await provisionSupabaseUserAndProfile({
          email: pending.email,
          name: pending.full_name,
          phone: pending.phone,
          age: pending.age,
          profession: pending.profession,
          address: pending.address,
          asaasCustomerId: pending.asaas_customer_id,
          asaasPaymentId: paymentId,
        });

        const { error: checkoutUpdateError } = await supabaseAdmin
          .from('pending_checkouts')
          .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
          .eq('payment_id', paymentId);
        if (checkoutUpdateError) throw checkoutUpdateError;
      } else if (!pending && verification.payment.customer) {
        // Pagamento fora do checkout do site (link direto do Asaas): o pagador vem do Asaas, não do evento.
        const { asaasService } = await import('@/services/asaas');
        const customer = await asaasService.getCustomer(verification.payment.customer);
        if (!customer?.email) throw new Error('Não foi possível localizar o pagador associado ao pagamento.');
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
            postalCode: customer.postalCode,
          } : null,
          asaasCustomerId: customer.id,
          asaasPaymentId: paymentId,
        });
      } else if (!pending) {
        throw new Error('Checkout pendente não encontrado e o pagamento não possui cliente associado.');
      }

      await markEvent('processed');
      return NextResponse.json({ received: true });
    }

    // 5. Reversão/cancelamento: retira o acesso no perfil e encerra as sessões antes de responder.
    const status = String(event.replace('PAYMENT_', ''));
    const { data: profile, error: profileLookupError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('asaas_payment_id', paymentId)
      .maybeSingle();
    if (profileLookupError) throw profileLookupError;

    const { error: checkoutError } = await supabaseAdmin
      .from('pending_checkouts')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('payment_id', paymentId);
    if (checkoutError) throw checkoutError;

    if (profile?.id) {
      const { error: revokeError } = await supabaseAdmin
        .from('profiles')
        .update({ has_access: false, payment_status: status, updated_at: new Date().toISOString() })
        .eq('id', profile.id);
      if (revokeError) throw revokeError;
      // Apaga na hora o cache de acesso, os tokens DRM e as URLs assinadas do aluno. Se o Redis falhar, o erro faz o Asaas repetir o evento.
      if (!(await invalidateUserAccess(profile.id))) throw new Error('Falha ao limpar o cache de acesso no Redis.');

      const { error: sessionsError } = await supabaseAdmin
        .from('user_active_sessions')
        .update({ is_active: false, replaced_at: new Date().toISOString() })
        .eq('user_id', profile.id)
        .eq('is_active', true);
      if (sessionsError) throw sessionsError;
    }

    await markEvent('processed');
    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('[Asaas Webhook Error]:', error instanceof Error ? error.message : 'Falha no processamento');
    if (trackedEventKey) {
      try {
        const { supabaseAdmin } = await import('@/utils/supabase/admin');
        await supabaseAdmin.from('payment_events').update({
          processing_status: 'failed',
          last_error: (error instanceof Error ? error.message : 'Falha no processamento').slice(0, 500),
        }).eq('provider_event_id', trackedEventKey).eq('processing_status', 'processing');
      } catch {
        /* o registro do erro não pode derrubar a resposta */
      }
    }
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
