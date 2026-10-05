import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Filtro contra SQL Injection
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Entrada inválida' }, { status: 400 });
    }

    const { userId, firstName, lastName, phone, email, avatarUrl } = sanitized;

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário não fornecido.' }, { status: 400 });
    }

    const fullName = [firstName || '', lastName || ''].join(' ').trim();

    // 2. Atualizar perfil na tabela public.profiles
    const updateData: Record<string, any> = {
      full_name: fullName,
      first_name: (firstName || '').trim() || fullName.split(' ')[0],
      last_name: (lastName || '').trim() || fullName.split(' ').slice(1).join(' '),
      phone: phone ? phone.trim() : null,
      updated_at: new Date().toISOString(),
    };

    if (email) {
      updateData.email = email.toLowerCase().trim();
    }

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (profileError) {
      console.error('Erro ao atualizar profiles:', profileError);
    }

    // 3. Atualizar dados no auth.users do Supabase
    const authUpdatePayload: Record<string, any> = {
      user_metadata: {
        full_name: fullName,
        phone: phone || '',
        avatar_url: avatarUrl || undefined,
      },
    };

    // Se o e-mail foi alterado e é diferente
    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      const { data: userRecord } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (userRecord?.user?.email?.toLowerCase() !== normalizedEmail) {
        authUpdatePayload.email = normalizedEmail;
        authUpdatePayload.email_confirm = true; // Confirma o novo e-mail
      }
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdatePayload);

    if (authError) {
      return NextResponse.json(
        { error: authError.message || 'Falha ao atualizar dados de autenticação.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dados cadastrais atualizados com sucesso!',
      user: {
        fullName,
        phone,
        email,
        avatarUrl,
      },
    });
  } catch (err: any) {
    console.error('[Update Profile Error]:', err);
    return NextResponse.json(
      { error: err?.message || 'Erro interno ao atualizar perfil.' },
      { status: 500 }
    );
  }
}
