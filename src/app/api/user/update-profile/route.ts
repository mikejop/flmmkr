import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { z } from 'zod';
import { readJsonLimited } from '@/utils/rateLimit';
import { NICKNAME_REGEX, normalizeNickname } from '@/lib/nickname';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';

export const dynamic = 'force-dynamic';

const profileSchema = z.object({
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().trim().toLowerCase().email().max(254).optional(),
  nickname: z.string().trim().max(40).optional(),
  avatarUrl: z.string().max(500).nullish(),
});

const AVATAR_EXT = /^avatar\.(jpg|png|webp|gif|avif)$/;

/** URL pública montada pelo servidor em /api/user/upload-avatar: https://<projeto>.supabase.co/storage/v1/object/public/avatars/<userId>/avatar.<ext> */
function isOwnAvatarUrl(value: string | null | undefined, userId: string): value is string {
  if (!value) return false;
  const base = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/+$/, '');
  if (!base) return false;
  const prefix = `${base}/storage/v1/object/public/avatars/${userId}/`;
  if (!value.startsWith(prefix)) return false;
  const rest = value.slice(prefix.length);
  return AVATAR_EXT.test(rest);
}

export async function POST(req: NextRequest) {
  try {
    const { user, supabase } = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    const userId = user.id;

    const parsed = profileSchema.safeParse(await readJsonLimited(req, 8 * 1024));
    if (!parsed.success) {
      return NextResponse.json({ error: 'Dados inválidos. Confira o tamanho dos campos (nome até 80 caracteres).' }, { status: 400 });
    }
    const { firstName, lastName, phone, email, nickname } = parsed.data;
    // O avatar só vale se for a URL pública do NOSSO bucket, na pasta do próprio aluno; qualquer outra é ignorada.
    const avatarUrl = isOwnAvatarUrl(parsed.data.avatarUrl, userId) ? parsed.data.avatarUrl : undefined;

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
        console.warn('[Update Profile] Troca de e-mail recusada:', emailError.message);
        return NextResponse.json({ error: 'Não foi possível solicitar a troca de e-mail.' }, { status: 400 });
      }
    }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdatePayload);

    if (authError) {
      console.error('[Update Profile] Falha ao atualizar o Auth:', authError.message);
      return NextResponse.json({ error: 'Não foi possível atualizar os dados de acesso.' }, { status: 400 });
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
    return NextResponse.json({ error: 'Erro interno ao atualizar perfil.' }, { status: 500 });
  }
}
