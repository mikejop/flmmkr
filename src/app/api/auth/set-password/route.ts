import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';
import { verifyAndSyncPaymentAccess } from '@/services/paymentVerificationService';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Tentativa de injeção SQL bloqueada.' }, { status: 400 });
    }
    const { email, password } = sanitized;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    // Regras estritas de senha: maiúscula, minúscula, número e caractere especial
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const hasMinLength = (password || '').length >= 8;

    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial || !hasMinLength) {
      return NextResponse.json(
        { error: 'A senha deve conter no mínimo 8 caracteres, com letra maiúscula, letra minúscula, número e caractere especial.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Localizar o usuário no Supabase Auth
    const { data: userList, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) {
      console.error('Erro ao listar usuários:', listErr);
      return NextResponse.json({ error: 'Erro ao localizar usuário.' }, { status: 500 });
    }

    const user = userList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. Verifique seu e-mail ou aguarde a confirmação do pagamento.' },
        { status: 404 }
      );
    }

    // 2. Dupla validação de pagamento (Servidor + Asaas)
    const paymentCheck = await verifyAndSyncPaymentAccess({
      userId: user.id,
      email: normalizedEmail
    });

    if (!paymentCheck.isAllowed) {
      return NextResponse.json(
        { error: `Acesso negado: pagamento não confirmado no Asaas (${paymentCheck.reason || 'Status não pago'}).` },
        { status: 403 }
      );
    }

    // 3. Atualizar a senha do usuário com criptografia segura
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true
    });

    if (updateErr) {
      console.error('Erro ao definir senha:', updateErr);
      return NextResponse.json({ error: updateErr.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Senha definida com sucesso.'
    });
  } catch (err: any) {
    console.error('Erro geral ao definir senha:', err);
    return NextResponse.json({ error: 'Erro interno ao processar solicitação.' }, { status: 500 });
  }
}
