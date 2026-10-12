import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não informado.' }, { status: 400 });
    }

    const { data: pending, error: pendingError } = await supabaseAdmin
      .from('pending_checkouts')
      .select('status')
      .eq('payment_id', paymentId)
      .maybeSingle();
    if (pendingError || !pending) return NextResponse.json({ error: 'Pagamento não encontrado.' }, { status: 404 });

    // 1. Consultar status no Asaas
    const payment = await asaasService.getPaymentStatus(paymentId);
    const isApproved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

    if (isApproved) {
      const isProvisioned = pending.status === 'CONFIRMED';

      return NextResponse.json({
        confirmed: true,
        status: payment.status,
        activationSent: isProvisioned
      });
    }

    if (payment.status === 'OVERDUE') {
      return NextResponse.json({
        confirmed: false,
        status: 'OVERDUE',
        message: 'O tempo para pagamento do PIX expirou.'
      });
    }

    return NextResponse.json({
      confirmed: false,
      status: payment.status
    });
  } catch (error: any) {
    console.error('Erro ao verificar status do pagamento:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao consultar status.' },
      { status: 500 }
    );
  }
}
