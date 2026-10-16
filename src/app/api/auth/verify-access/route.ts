import { NextResponse } from 'next/server';
import { verifyAccessCached } from '@/services/paymentVerificationService';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { user } = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ allowed: false, error: 'Sessão não autenticada.' }, { status: 401 });
    }

    // Dupla checagem: Servidor + Asaas
    const check = await verifyAccessCached({
      userId: user.id,
      email: user.email
    });

    if (!check.isAllowed) {
      return NextResponse.json(
        {
          allowed: false,
          error: check.reason || 'Pagamento não confirmado pelo Asaas.'
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      allowed: true,
      status: check.status,
      email: user.email
    });
  } catch (err: any) {
    console.error('[verify-access]', err);
    return NextResponse.json({ allowed: false, error: 'Erro ao checar acesso' }, { status: 500 });
  }
}
