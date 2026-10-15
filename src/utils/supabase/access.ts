import 'server-only';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { getAuthenticatedUser } from '@/utils/supabase/authenticated';
import { supabaseAdmin } from '@/utils/supabase/admin';

export interface ActiveStudent {
  user: User;
  profile: { role: string | null; full_name: string | null; first_name: string | null; avatar_url: string | null };
}

/**
 * Exige sessão válida E acesso ativo (pagamento confirmado ou administrador), conferidos no banco a cada chamada.
 * Devolve 401 sem sessão e 403 sem acesso, sempre com mensagem genérica.
 */
export async function requireActiveStudent(): Promise<{ ok: true; student: ActiveStudent } | { ok: false; response: NextResponse }> {
  const { user } = await getAuthenticatedUser();
  if (!user) {
    return { ok: false, response: NextResponse.json({ error: 'Não autenticado.' }, { status: 401, headers: { 'Cache-Control': 'private, no-store' } }) };
  }
  const { data: profile, error } = await supabaseAdmin
    .from('profiles')
    .select('role, has_access, payment_status, full_name, first_name, avatar_url')
    .eq('id', user.id)
    .maybeSingle();
  const allowed = !error && (profile?.role === 'admin' || (profile?.has_access === true && profile?.payment_status === 'CONFIRMED'));
  if (!allowed || !profile) {
    return { ok: false, response: NextResponse.json({ error: 'Acesso não autorizado.' }, { status: 403, headers: { 'Cache-Control': 'private, no-store' } }) };
  }
  return { ok: true, student: { user, profile } };
}
