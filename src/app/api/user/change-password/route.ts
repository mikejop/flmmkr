import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/services/userService';
import { validateAndSanitizeBody } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Filtro contra SQL Injection
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Tentativa de injeção SQL bloqueada.' }, { status: 400 });
    }

    const { userId, currentPassword, newPassword } = sanitized;

    if (!userId || !currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Por favor, informe a senha atual e a nova senha.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha deve ter no mínimo 6 caracteres.' },
        { status: 400 }
      );
    }

    // 2. Buscar o e-mail do usuário
    const { data: userRecord, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userRecord?.user?.email) {
      return NextResponse.json(
        { error: 'Usuário não localizado no sistema.' },
        { status: 404 }
      );
    }

    const userEmail = userRecord.user.email;

    // 3. Validar a Senha Atual do usuário
    const { data: verifyData, error: verifyError } = await supabaseAdmin.auth.signInWithPassword({
      email: userEmail,
      password: currentPassword,
    });

    if (verifyError || !verifyData?.user) {
      return NextResponse.json(
        { error: 'A senha atual está incorreta. Verifique e tente novamente.' },
        { status: 400 }
      );
    }

    // 4. Atualizar para a Nova Senha com privilégios de Admin
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message || 'Falha ao atualizar a senha.' },
        { status: 400 }
      );
    }

    // 5. Registrar log de auditoria de segurança
    await supabaseAdmin.from('security_audit_logs').insert({
      event_type: 'password_changed',
      user_id: userId,
      email: userEmail,
      details: {
        timestamp: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso! Utilize sua nova senha no próximo acesso.',
    });
  } catch (err: any) {
    console.error('[Change Password Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro interno ao alterar senha.' },
      { status: 500 }
    );
  }
}
