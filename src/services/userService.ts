import { supabaseAdmin } from '@/utils/supabase/admin';

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
 * Cria usuário no Supabase Auth e insere dados na tabela profiles
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
    // Gerar senha provisória aleatória; o usuário definirá a senha na tela seguinte
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

  // 2. Inserir ou atualizar na tabela profiles
  if (user) {
    // Preservar role de admin se já existir
    const currentRole = user.app_metadata?.role || user.user_metadata?.role;
    const assignedRole = currentRole === 'admin' ? 'admin' : 'student';

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
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileErr) {
      console.error('Erro ao atualizar profiles no Supabase:', profileErr);
    }
  }

  return user;
}
