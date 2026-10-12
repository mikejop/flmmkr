import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { validateAndSanitizeBody } from '@/utils/security';
import { NICKNAME_REGEX, normalizeNickname } from '@/lib/nickname';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Filtro contra SQL Injection
    const { safe, sanitized, reason } = validateAndSanitizeBody(rawBody);
    if (!safe) {
      return NextResponse.json({ error: reason || 'Entrada inválida' }, { status: 400 });
    }

    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;
    const { firstName, lastName, phone, email, avatarUrl, nickname } = sanitized;

    const fullName = [firstName || '', lastName || ''].join(' ').trim();

    // 2. Atualizar perfil na tabela public.profiles
    const updateData: Record<string, any> = {
      full_name: fullName,
      first_name: (firstName || '').trim() || fullName.split(' ')[0],
      last_name: (lastName || '').trim() || fullName.split(' ').slice(1).join(' '),
      phone: phone ? phone.trim() : null,
      updated_at: new Date().toISOString(),
    };

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : user.email;
    const emailChangeRequested = !!normalizedEmail && normalizedEmail !== user.email?.toLowerCase();

    if (avatarUrl) {
      updateData.avatar_url = avatarUrl;
    }

    // Nickname (@usuario): sem espaços, único
    if (typeof nickname === 'string' && nickname.trim()) {
      const cleanNick = normalizeNickname(nickname);
      if (!NICKNAME_REGEX.test(cleanNick)) {
        return NextResponse.json(
          { error: 'O nome de usuário deve ter de 3 a 20 caracteres, usando apenas letras, números e _ (sem espaços).' },
          { status: 400 }
        );
      }
      const { data: taken } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('nickname', cleanNick)
        .neq('id', userId)
        .maybeSingle();
      if (taken) {
        return NextResponse.json({ error: `O nome de usuário @${cleanNick} já está em uso.` }, { status: 409 });
      }
      updateData.nickname = cleanNick;
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (profileError) {
      console.error('Erro ao atualizar profiles:', profileError);
      return NextResponse.json({ error: 'Não foi possível atualizar o perfil.' }, { status: 500 });
    }

    // 3. Atualizar dados no auth.users do Supabase
    const authUpdatePayload: Record<string, any> = {
      user_metadata: {
        full_name: fullName,
        phone: phone || '',
        avatar_url: avatarUrl || undefined,
      },
    };

    if (emailChangeRequested) {
      const { error: emailError } = await supabase.auth.updateUser({ email: normalizedEmail });
      if (emailError) {
        return NextResponse.json({ error: emailError.message || 'Não foi possível solicitar a troca de e-mail.' }, { status: 400 });
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
        email: user.email,
        emailChangeRequested,
        pendingEmail: emailChangeRequested ? normalizedEmail : null,
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
