import 'server-only';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getClientIp } from '@/utils/clientIp';
import { hashClientIp } from '@/utils/ipHash';

/**
 * Registra uma ação sensível em `audit_log` (só a service role escreve). Nunca lança: falha de auditoria não derruba a ação,
 * mas vai para o log do servidor. `metadata` não deve ter dado pessoal (sem e-mail, CPF, nome).
 */
export async function logAudit(params: {
  userId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  request?: Request;
}): Promise<void> {
  try {
    const ip = params.request ? getClientIp(params.request) : null;
    const { error } = await supabaseAdmin.from('audit_log').insert({
      user_id: params.userId ?? null,
      action: params.action.slice(0, 80),
      metadata: params.metadata ?? {},
      ip_hash: ip ? hashClientIp(ip) : null,
    });
    if (error) console.error('[audit] falha ao gravar', params.action, error.message);
  } catch (err) {
    console.error('[audit] exceção ao gravar', params.action, err instanceof Error ? err.message : err);
  }
}
