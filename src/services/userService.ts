import { supabaseAdmin } from '@/utils/supabase/admin';
import { invalidateUserAccess } from '@/utils/accessCache';
import { createActivationToken } from '@/services/activationService';
import { sendActivationEmail } from '@/services/emailService';
import crypto from 'crypto';

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
async function provisionInner({
  email,
  name,
  phone,
  birthDate,
  age,
  profession,
  address,
  asaasCustomerId,
  asaasPaymentId
}: ProvisionUserInput): Promise<{ user: unknown; emailSent?: boolean; activationToken?: null; activationUrl?: null }> {
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Verificar se usuário já existe no auth
  let user: import('@supabase/supabase-js').User | null = null;
  for (let page = 1; page <= 20; page += 1) {
    const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (listError) throw listError;
    user = userList.users.find((u) => u.email?.toLowerCase() === normalizedEmail) || null;
    if (user || userList.users.length < 1000) break;
  }

  if (!user) {
    // Gerar senha provisória aleatória; o usuário definirá a senha na tela de Primeiro Acesso
    const tempPassword = `Flmmkr#${crypto.randomBytes(32).toString('hex')}`;
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
    const currentRole = user.app_metadata?.role;
    const assignedRole = currentRole === 'admin' ? 'admin' : 'student';

    const { data: existingProfile, error: existingProfileError } = await supabaseAdmin
      .from('profiles').select('asaas_payment_id, payment_status').eq('id', user.id).maybeSingle();
    if (existingProfileError) throw existingProfileError;
    if (asaasPaymentId && existingProfile?.asaas_payment_id === asaasPaymentId && existingProfile.payment_status === 'CONFIRMED') {
      return { user, activationToken: null, activationUrl: null };
    }

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
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (profileErr) {
      console.error('Erro ao atualizar profiles no Supabase:', profileErr);
      throw profileErr;
    }

    // Acesso liberado: descarta qualquer cache antigo desse aluno (acesso, tokens DRM, URLs assinadas).
    await invalidateUserAccess(user.id);

    // Disparar e-mail de ativação com o link e botão clicável
    let emailSent = false;
    try {
      emailSent = await sendActivationEmail({
        email: normalizedEmail,
        name,
        activationUrl: tokenResult.url
      });
    } catch (mailErr) {
      console.error('[userService] Erro ao enviar e-mail de ativação:', mailErr);
    }
    return { user, emailSent };
  }

  return {
    user,
  };
}

export type ProvisionResult = { status: 'done' | 'already_done' | 'in_progress'; user?: unknown };

/**
 * Cria a conta e envia o link de primeiro acesso, UMA vez por pagamento.
 * O cartão aprovado dispara isto no checkout e o webhook dispara de novo: sem trava, o aluno recebia dois e-mails
 * e o link do primeiro era invalidado pelo segundo. A trava é uma linha em payment_events (provider_event_id UNIQUE).
 * Se o envio do e-mail falhar, lança erro: o webhook responde 500 e o Asaas reenvia o evento (nova tentativa).
 */
export async function provisionSupabaseUserAndProfile(input: ProvisionUserInput): Promise<ProvisionResult> {
  const paymentId = input.asaasPaymentId;
  if (!paymentId) {
    const result = await provisionInner(input);
    if (result.emailSent === false) throw new Error('Falha ao enviar o e-mail de primeiro acesso.');
    return { status: 'done', user: result.user };
  }

  const claimKey = `provision:${paymentId}`;
  const STALE_MS = 10 * 60 * 1000;
  const { error: claimError } = await supabaseAdmin.from('payment_events').insert({
    provider_event_id: claimKey,
    provider_payment_id: paymentId,
    event_type: 'PROVISION',
    processing_status: 'processing',
    payload: { claim: true },
  });
  if (claimError) {
    if (claimError.code !== '23505') throw claimError;
    const { data: previous } = await supabaseAdmin
      .from('payment_events').select('processing_status, received_at').eq('provider_event_id', claimKey).maybeSingle();
    if (previous?.processing_status === 'processed') return { status: 'already_done' };
    const stale = previous && Date.now() - new Date(previous.received_at).getTime() > STALE_MS;
    if (!stale) return { status: 'in_progress' };
    // Tentativa antiga travada (servidor caiu no meio): assume o trabalho.
    await supabaseAdmin.from('payment_events').update({ received_at: new Date().toISOString() }).eq('provider_event_id', claimKey);
  }

  try {
    const result = await provisionInner(input);
    if (result.emailSent === false) throw new Error('Falha ao enviar o e-mail de primeiro acesso.');
    await supabaseAdmin.from('payment_events')
      .update({ processing_status: 'processed', processed_at: new Date().toISOString() }).eq('provider_event_id', claimKey);
    return { status: 'done', user: result.user };
  } catch (err) {
    // Libera a trava para a próxima tentativa (reenvio do webhook) refazer o trabalho.
    await supabaseAdmin.from('payment_events').delete().eq('provider_event_id', claimKey);
    throw err;
  }
}
