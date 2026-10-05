import { supabaseAdmin } from '@/utils/supabase/admin';

/** Nickname: 3–20 caracteres, minúsculas, números e _ (sem espaços). */
export const NICKNAME_REGEX = /^[a-z0-9_]{3,20}$/;

export function normalizeNickname(raw: string): string {
  return (raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^@+/, '')
    .replace(/[^a-z0-9_]/g, '');
}

/** Garante que o perfil tenha nickname único; gera automaticamente se estiver vazio. */
export async function ensureNickname(userId: string): Promise<string | null> {
  const { data: prof } = await supabaseAdmin
    .from('profiles')
    .select('id, nickname, first_name, full_name, email')
    .eq('id', userId)
    .maybeSingle();

  if (!prof) return null;
  if (prof.nickname) return prof.nickname;

  let base = normalizeNickname(
    prof.first_name || (prof.full_name || '').split(' ')[0] || (prof.email || '').split('@')[0] || 'aluno'
  );
  if (base.length < 3) base = base.padEnd(3, '0');
  base = base.slice(0, 16);

  for (let n = 1; n < 200; n++) {
    const candidate = n === 1 ? base : `${base}${n}`;
    const { data: taken } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('nickname', candidate)
      .maybeSingle();
    if (!taken) {
      const { error } = await supabaseAdmin.from('profiles').update({ nickname: candidate }).eq('id', userId);
      if (!error) return candidate;
    }
  }
  return null;
}
