import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      location,
      profession,
      paymentMethod,
      reason
    } = body;

    // Registra apenas se ao menos tiver nome ou profissão preenchidos
    if (!name && !profession && !location) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const { error } = await supabaseAdmin
      .from('checkout_abandonment_leads')
      .insert({
        full_name: name || 'Não informado',
        email: email || null,
        phone: phone || null,
        location: location || null,
        profession: profession || null,
        status: 'abandono_carrinho',
        payment_method: paymentMethod || null,
        failure_reason: reason || 'Usuário fechou o modal de checkout sem concluir o pagamento',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erro ao registrar lead de abandono:', error);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Erro no endpoint de abandono de carrinho:', err?.message || err);
    return NextResponse.json({ error: 'Erro ao registrar abandono' }, { status: 500 });
  }
}
