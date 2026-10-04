import { NextRequest, NextResponse } from 'next/server';
import { asaasService } from '@/services/asaas';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { provisionSupabaseUserAndProfile } from '@/services/userService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get('paymentId');

    if (!paymentId) {
      return NextResponse.json({ error: 'ID do pagamento não informado.' }, { status: 400 });
    }

    // 1. Consultar status no Asaas
    const payment = await asaasService.getPaymentStatus(paymentId);
    const isApproved = payment.status === 'CONFIRMED' || payment.status === 'RECEIVED';

    if (isApproved) {
      // 2. Buscar dados da sessão pendente
      const { data: pending } = await supabaseAdmin
        .from('pending_checkouts')
        .select('*')
        .eq('payment_id', paymentId)
        .maybeSingle();

      if (pending && pending.status !== 'CONFIRMED') {
        // Criar usuário e perfil no Supabase
        await provisionSupabaseUserAndProfile({
          email: pending.email,
          name: pending.full_name,
          phone: pending.phone,
          age: pending.age,
          profession: pending.profession,
          address: pending.address,
          asaasCustomerId: pending.asaas_customer_id,
          asaasPaymentId: paymentId
        });

        // Atualizar status no pending_checkouts
        await supabaseAdmin
          .from('pending_checkouts')
          .update({ status: 'CONFIRMED', updated_at: new Date().toISOString() })
          .eq('payment_id', paymentId);
      }

      const redirectEmail = pending?.email || payment?.clientPaymentDate || '';
      const redirectName = pending?.full_name || '';

      return NextResponse.json({
        confirmed: true,
        status: payment.status,
        redirectUrl: `/definir-senha?email=${encodeURIComponent(redirectEmail)}&name=${encodeURIComponent(redirectName)}`
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
