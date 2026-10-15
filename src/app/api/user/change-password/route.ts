import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Filtro contra SQL Injection
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Tentativa de injeção SQL bloqueada.' }, { status: 400 });
    }

    const { currentPassword, newPassword } = sanitized;
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Por favor, informe a senha atual e a nova senha.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      return NextResponse.json(
        { error: 'A nova senha deve ter ao menos 8 caracteres, com maiúscula, minúscula, número e caractere especial.' },
        { status: 400 }
      );
    }

    // 2. Buscar o e-mail do usuário
    if (!user.email) return NextResponse.json({ error: 'Conta sem e-mail de acesso.' }, { status: 400 });

    // Reautentica a própria conta antes de permitir a troca.
    const { error: verifyError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
    if (verifyError) return NextResponse.json({ error: 'A senha atual está incorreta.' }, { status: 400 });

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

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
      email: user.email,
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
      { error: 'Erro interno ao alterar senha.' },
      { status: 500 }
    );
  }
}
