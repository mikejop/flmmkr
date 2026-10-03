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
        // Pagamento aprovado -> Liberar acesso do aluno
        console.log(`[Asaas Webhook] Pagamento confirmado: ${payment?.id}, valor: ${payment?.value}`);
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
