import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { verifyAndSyncPaymentAccess } from '@/services/paymentVerificationService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let user = null;
    if (token) {
      const { data } = await supabaseAdmin.auth.getUser(token);
      user = data.user;
    }

    if (!user) {
      // Tentar pegar dos cookies da requisição
      const allCookies = req.cookies.getAll();
      const authCookie = allCookies.find((c) =>
        c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name.includes('auth-token'))
      );

      if (authCookie) {
        try {
          const parsed = JSON.parse(decodeURIComponent(authCookie.value));
          const accessToken = parsed?.[0] || parsed?.access_token;
          if (accessToken) {
            const { data } = await supabaseAdmin.auth.getUser(accessToken);
            user = data.user;
          }
        } catch {}
      }
    }

    if (!user) {
      return NextResponse.json({ allowed: false, error: 'Sessão não autenticada.' }, { status: 401 });
    }

    // Dupla checagem: Servidor + Asaas
    const check = await verifyAndSyncPaymentAccess({
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
    return NextResponse.json({ allowed: false, error: err?.message || 'Erro ao checar acesso' }, { status: 500 });
  }
}
