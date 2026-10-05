import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';

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

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres.' },
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

    // 2. Atualizar a senha do usuário
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
  } catch (error: any) {
    console.error('Erro ao definir senha inicial:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Falha ao salvar senha.' },
      { status: 500 }
    );
  }
}
