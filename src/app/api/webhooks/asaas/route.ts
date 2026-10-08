import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Validar token do webhook se configurado
    const expectedToken = process.env.ASAAS_WEBHOOK_SECRET;
    const receivedToken = req.headers.get('asaas-access-token');

    if (expectedToken && receivedToken !== expectedToken) {
      return NextResponse.json({ error: 'Token de autenticação inválido.' }, { status: 401 });
    }

    const payload = await req.json();
    const event = payload?.event;
    const payment = payload?.payment;

    console.log(`[Asaas Webhook] Evento recebido: ${event} para cobrança ${payment?.id}`);

    // Tratamento dos eventos principais
    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        // Pagamento aprovado -> Liberar acesso do aluno e criar perfil no Supabase
        console.log(`[Asaas Webhook] Pagamento confirmado: ${payment?.id}, valor: ${payment?.value}`);
        if (payment?.id) {
          try {
            const { supabaseAdmin } = await import('@/utils/supabase/admin');
            const { provisionSupabaseUserAndProfile } = await import('@/services/userService');


            const { data: pending } = await supabaseAdmin
              .from('pending_checkouts')
              .select('*')
              .eq('payment_id', payment.id)
              .maybeSingle();

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

              await supabaseAdmin
                .from('pending_checkouts')
                .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
                .eq('payment_id', payment.id);
            } else if (!pending && payment?.customer) {
              // Pagamento realizado via link direto do Asaas (fora do pending_checkouts)
              const { asaasService } = await import('@/services/asaas');
              const customer = await asaasService.getCustomer(payment.customer);
              if (customer && customer.email) {
                await provisionSupabaseUserAndProfile({
                  email: customer.email,
                  name: customer.name || 'Aluno FLMMKR',
                  phone: customer.mobilePhone || customer.phone || null,
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
              }
            }
          } catch (provErr) {
            console.error('[Asaas Webhook Provisioning Error]:', provErr);
          }
        }
        break;

      case 'PAYMENT_OVERDUE':
        // Pagamento vencido
        console.log(`[Asaas Webhook] Pagamento vencido: ${payment?.id}`);
        break;

      case 'PAYMENT_REFUNDED':
        // Pagamento estornado
        console.log(`[Asaas Webhook] Pagamento estornado: ${payment?.id}`);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[Asaas Webhook Error]:', error?.message || error);
    return NextResponse.json({ error: 'Erro ao processar webhook' }, { status: 500 });
  }
}
