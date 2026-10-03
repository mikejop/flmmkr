import { createClient } from '@supabase/supabase-js';

export interface UserTimerRecord {
  id?: string;
  ip: string;
  clientIdentifier: string;
  userAgent?: string;
  firstAccessAt: string;
  expiresAt: string;
  cooldownUntil: string;
  isExpired: boolean;
  createdAt?: string;
}

/**
 * Função para calcular o preço promocional de acordo com as datas dos lotes:
 * - Até 06/10/2026: R$ 95
 * - De 07/10/2026 até 09/10/2026: R$ 125
 * - De 10/10/2026 até 13/10/2026: R$ 145
 * - A partir de 14/10/2026: R$ 195 (Preço normal)
 */
export function getCurrentBatchPrice(now: Date = new Date()): {
  promoPrice: number;
  regularPrice: number;
  batchName: string;
  nextPriceDate?: string;
} {
  const regularPrice = 195;
  const currentYear = now.getFullYear();

  const refDate = new Date(now);
  if (currentYear < 2026) {
    refDate.setFullYear(2026);
  }

  const lote1End = new Date('2026-10-06T23:59:59-03:00');
  const lote2End = new Date('2026-10-09T23:59:59-03:00');
  const lote3End = new Date('2026-10-13T23:59:59-03:00');

  if (refDate <= lote1End) {
    return {
      promoPrice: 95,
      regularPrice,
      batchName: 'Lote Especial de Abertura',
      nextPriceDate: '06/10/2026'
    };
  }

  if (refDate <= lote2End) {
    return {
      promoPrice: 125,
      regularPrice,
      batchName: '2º Lote Promocional',
      nextPriceDate: '09/10/2026'
    };
  }

  if (refDate <= lote3End) {
    return {
      promoPrice: 145,
      regularPrice,
      batchName: '3º Lote Promocional',
      nextPriceDate: '13/10/2026'
    };
  }

  return {
    promoPrice: regularPrice,
    regularPrice,
    batchName: 'Preço Oficial Regular'
  };
}

/**
 * Supabase Client (Admin/Service-Role para salvar sessões com segurança no backend)
 */
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (url && secret) {
    return createClient(url, secret, {
      auth: { persistSession: false }
    });
  }
  return null;
}

/**
 * Busca ou salva a sessão no Supabase (com retenção de 36h)
 */
export async function getOrUpdateSupabaseSession(record: UserTimerRecord): Promise<UserTimerRecord | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  try {
    // 1. Procurar sessão por client_identifier ou por IP
    const { data: existing, error: findErr } = await supabase
      .from('offer_timer_sessions')
      .select('*')
      .or(`client_identifier.eq.${record.clientIdentifier},ip.eq.${record.ip}`)
      .order('first_access_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (findErr && findErr.code !== 'PGRST116') {
      console.warn('[Supabase Timer] Erro ao buscar sessão:', findErr.message);
    }

    if (existing) {
      return {
        id: existing.id,
        ip: existing.ip,
        clientIdentifier: existing.client_identifier,
        userAgent: existing.user_agent,
        firstAccessAt: existing.first_access_at,
        expiresAt: existing.expires_at,
        cooldownUntil: existing.cooldown_until,
        isExpired: existing.is_expired
      };
    }

    // 2. Inserir nova sessão no Supabase
    const { data: inserted, error: insertErr } = await supabase
      .from('offer_timer_sessions')
      .insert({
        ip: record.ip,
        client_identifier: record.clientIdentifier,
        user_agent: record.userAgent,
        first_access_at: record.firstAccessAt,
        expires_at: record.expiresAt,
        cooldown_until: record.cooldownUntil,
        is_expired: record.isExpired
      })
      .select()
      .maybeSingle();

    if (insertErr) {
      console.warn('[Supabase Timer] Erro ao salvar sessão:', insertErr.message);
    }

    return inserted ? {
      id: inserted.id,
      ip: inserted.ip,
      clientIdentifier: inserted.client_identifier,
      userAgent: inserted.user_agent,
      firstAccessAt: inserted.first_access_at,
      expiresAt: inserted.expires_at,
      cooldownUntil: inserted.cooldown_until,
      isExpired: inserted.is_expired
    } : null;
  } catch (err: any) {
    console.warn('[Supabase Timer] Exceção ao conectar:', err?.message || err);
    return null;
  }
}

/**
 * Atualiza o status de expiração da sessão no Supabase
 */
export async function updateSessionExpirationInSupabase(clientIdentifier: string, isExpired: boolean): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return;

  try {
    await supabase
      .from('offer_timer_sessions')
      .update({ is_expired: isExpired, updated_at: new Date().toISOString() })
      .eq('client_identifier', clientIdentifier);
  } catch (err) {
    // Silencioso
  }
}
