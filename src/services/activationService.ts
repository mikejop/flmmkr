import crypto from 'crypto';
import { supabaseAdmin } from '@/utils/supabase/admin';

export interface ActivationTokenResult {
  token: string;
  url: string;
  expiresAt: string;
}

/**
 * Gera um token com sufixo exclusivo e intransferível para o usuário
 */
export async function createActivationToken(
  userId: string,
  email: string
): Promise<ActivationTokenResult> {
  const normalizedEmail = email.trim().toLowerCase();
  
  // Sufixo criptográfico exclusivo de alta entropia (32 bytes = 64 hex chars)
  const suffix = crypto.randomBytes(32).toString('hex');
  const token = `flm_${suffix}`;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  
  // Link de ativação expira em 24 horas.
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  // Invalida tokens anteriores não utilizados do mesmo e-mail
  await supabaseAdmin
    .from('user_activation_tokens')
    .update({ used: true })
    .eq('email', normalizedEmail)
    .eq('used', false);

  // Insere novo token
  const { error: insertErr } = await supabaseAdmin
    .from('user_activation_tokens')
    .insert({
      user_id: userId,
      email: normalizedEmail,
      token: tokenHash,
      expires_at: expiresAt,
      used: false
    });

  if (insertErr) {
    console.error('[createActivationToken] Erro ao gravar token:', insertErr);
    throw insertErr;
  }

  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://flmmkr.site').replace(/\/$/, '');
  const url = `${siteUrl}/primeiro-acesso/${token}`;

  return {
    token,
    url,
    expiresAt
  };
}

/**
 * Valida se um token é legítimo, ativo e não expirado
 */
export async function validateActivationToken(token: string) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Token não fornecido.' };
  }

  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  let { data: record, error } = await supabaseAdmin
    .from('user_activation_tokens')
    .select('*')
    .eq('token', tokenHash)
    .maybeSingle();

  // During rollout, transparently migrate still-valid links issued before token hashing.
  if (!record && !error) {
    const legacy = await supabaseAdmin.from('user_activation_tokens').select('*').eq('token', token.trim()).maybeSingle();
    record = legacy.data;
    error = legacy.error;
    if (record && !record.used && new Date(record.expires_at).getTime() > Date.now()) {
      const { error: migrateError } = await supabaseAdmin
        .from('user_activation_tokens').update({ token: tokenHash }).eq('id', record.id).eq('used', false);
      if (migrateError) return { valid: false, reason: 'Não foi possível validar o link. Solicite um novo e-mail.' };
    }
  }

  if (error || !record) {
    return { valid: false, reason: 'Link de ativação inválido ou não encontrado.' };
  }

  if (record.used) {
    return { valid: false, reason: 'Este link de primeiro acesso já foi utilizado. Faça login diretamente.' };
  }

  const now = new Date();
  const expires = new Date(record.expires_at);
  if (now > expires) {
    return { valid: false, reason: 'Este link expirou. Solicite um novo acesso.' };
  }

  return {
    valid: true,
    record,
    userId: record.user_id,
    email: record.email
  };
}

/**
 * Marca o token como consumido após a criação da senha
 */
export async function consumeActivationToken(token: string): Promise<boolean> {
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  const { data, error } = await supabaseAdmin
    .from('user_activation_tokens')
    .update({ used: true })
    .eq('token', tokenHash)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .select('id')
    .maybeSingle();
  return !error && !!data;
}

export async function releaseActivationToken(token: string): Promise<void> {
  const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
  await supabaseAdmin.from('user_activation_tokens').update({ used: false }).eq('token', tokenHash);
}
