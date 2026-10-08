import { supabaseAdmin } from '@/utils/supabase/admin';
import { createActivationToken } from '@/services/activationService';
import { sendActivationEmail } from '@/services/emailService';

export { supabaseAdmin };

export interface ProvisionUserInput {
  email: string;
  name: string;
  phone?: string;
  birthDate?: string;
  age?: number | null;
  profession?: string;
  address?: any;
  asaasCustomerId?: string;
  asaasPaymentId?: string;
}

/**
 * Cria usuário no Supabase Auth e insere dados na tabela profiles,
 * gerando o sufixo/token exclusivo de primeiro acesso e enviando o e-mail de liberação.
 * Bypassa RLS usando o client admin service-role
 */
export async function provisionSupabaseUserAndProfile({
  email,
  name,
  phone,
  birthDate,
  age,
  profession,
  address,
  asaasCustomerId,
  asaasPaymentId
}: ProvisionUserInput) {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verificar se usuário já existe no auth
  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  let user = userList?.users?.find((u) => u.email?.toLowerCase() === normalizedEmail);

  if (!user) {
    // Gerar senha provisória aleatória; o usuário definirá a senha na tela de Primeiro Acesso
    const tempPassword = `Flmmkr#${Math.random().toString(36).slice(2)}${Date.now()}`;
    const { data: newUser, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: tempPassword,
      email_confirm: true,
      app_metadata: {
        role: 'student',
        has_access: true
      },
      user_metadata: {
        full_name: name,
        phone,
        role: 'student',
        has_access: true
      }
    });

    if (createErr) {
      console.error('Erro ao criar usuário auth no Supabase:', createErr);
      throw createErr;
    }
    user = newUser.user;
  }

  let tokenResult = null;

  // 2. Inserir ou atualizar na tabela profiles
  if (user) {
    // Preservar role de admin se já existir
    const currentRole = user.app_metadata?.role || user.user_metadata?.role;
    const assignedRole = currentRole === 'admin' ? 'admin' : 'student';

    // Gerar token/sufixo exclusivo para o primeiro acesso
    tokenResult = await createActivationToken(user.id, normalizedEmail);

    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: user.id,
        email: normalizedEmail,
        full_name: name,
        phone: phone || null,
        birth_date: birthDate || null,
        age: age || null,
        profession: profession || null,
        address: address || null,
        asaas_customer_id: asaasCustomerId || null,
        asaas_payment_id: asaasPaymentId || null,
        role: assignedRole,
        has_access: true,
        payment_status: 'CONFIRMED',
        access_suffix: tokenResult.token,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileErr) {
      console.error('Erro ao atualizar profiles no Supabase:', profileErr);
    }

    // Disparar e-mail de ativação com o link e botão clicável
    try {
      await sendActivationEmail({
        email: normalizedEmail,
        name,
        activationUrl: tokenResult.url
      });
    } catch (mailErr) {
      console.error('[userService] Erro ao enviar e-mail de ativação:', mailErr);
    }
  }

  return {
    user,
    activationToken: tokenResult?.token,
    activationUrl: tokenResult?.url
  };
}
