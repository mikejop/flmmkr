import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { hashClientIp } from '@/utils/ipHash';
import { getCurrentBatchPrice, LOTE1_END_ISO } from './priceSchedule.ts';

export interface UserTimerRecord {
  id?: string;
  /** HMAC do IP (ver utils/ipHash); null quando não há IP ou segredo. */
  ip: string | null;
  clientIdentifier?: string;
  userAgent?: string;
  firstAccessAt: string;
  expiresAt: string;
  cooldownUntil: string;
  isExpired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const COOLDOWN_DURATION_MS = 36 * 60 * 60 * 1000; // 36 horas após expirar

// The database is authoritative; this short cache is keyed only by a random server cookie.
const sessionCache = new Map<string, UserTimerRecord>();

export { getCurrentBatchPrice, LOTE1_END_ISO, LOTE2_END_ISO, LOTE3_END_ISO } from './priceSchedule.ts';
export type { BatchPriceInfo, PricePhaseId } from './priceSchedule.ts';

/**
 * Supabase Admin Client (Service Role - Acesso restrito ao backend)
 */
function getSupabaseAdmin() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const secret = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  if (url && (url.startsWith('http://') || url.startsWith('https://')) && secret && secret !== 'undefined') {
    try {
      return createClient(url, secret, {
        auth: { persistSession: false }
      });
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Atualiza o cache local em memória
 */
function updateMemoryCache(record: UserTimerRecord) {
  if (record.clientIdentifier) sessionCache.set(record.clientIdentifier, record);
}

/**
 * Resolve e gerencia a sessão do cronômetro da oferta:
 *
 * 1. A sessão é localizada só pelo identificador do cookie do servidor (client_identifier, único).
 *    O IP é guardado apenas como hash (HMAC) para auditoria e nunca serve de chave, então a falta
 *    de IP não cria sessões duplicadas nem reinicia o cronômetro.
 * 2. Sem sessão, cria uma nova (duração conforme a fase de preço: 15, 10 ou 3 minutos).
 * 3. COOLDOWN DE 36 HORAS: se o tempo acabar, o aluno fica sem a promoção por 36 h e depois o cronômetro recomeça.
 */
export async function resolveOfferTimerSession(clientIdentifier: string, clientIp?: string | null): Promise<UserTimerRecord> {
  const normalizedIdentifier = clientIdentifier.trim();
  // Os chamadores passam o SHA-256 (64 caracteres hexadecimais) do cookie da oferta.
  if (!/^[a-f0-9]{64}$/i.test(normalizedIdentifier)) throw new Error('Sessão de oferta inválida.');
  const now = Date.now();
  const ipHash = hashClientIp(clientIp);
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase não configurado para persistir a oferta.');

  let session = sessionCache.get(normalizedIdentifier) || null;
  if (!session) {
    const { data, error } = await supabase
      .from('offer_timer_sessions')
      .select('id, client_identifier, first_access_at, expires_at, cooldown_until, is_expired')
      .eq('client_identifier', normalizedIdentifier)
      .order('first_access_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('Não foi possível carregar o cronômetro da oferta.');
    if (data) {
      session = {
        id: data.id,
        clientIdentifier: normalizedIdentifier,
        ip: ipHash,
        firstAccessAt: data.first_access_at,
        expiresAt: data.expires_at,
        cooldownUntil: data.cooldown_until,
        isExpired: data.is_expired,
      };
    }
  }

  const launchEnd = new Date(LOTE1_END_ISO).getTime();
  if (session && now < launchEnd) {
    session.isExpired = false;
    return session;
  }

  // Cada fase de preço tem o seu cronômetro: quem entra numa fase nova (ou volta depois do período de espera) ganha um novo.
  const currentPhase = getCurrentBatchPrice(new Date(now));
  const timerMs = Math.max(1, currentPhase.timerMinutes) * 60 * 1000;
  const sessionPhase = session ? getCurrentBatchPrice(new Date(session.firstAccessAt)).phaseId : null;

  const shouldStart = !session || now >= new Date(session.cooldownUntil).getTime() ||
    sessionPhase !== currentPhase.phaseId;
  const firstAccessAt = shouldStart ? new Date(now).toISOString() : session!.firstAccessAt;
  const expiresAt = shouldStart ? new Date(now + timerMs).toISOString() : session!.expiresAt;
  const cooldownUntil = shouldStart
    ? new Date(now + timerMs + COOLDOWN_DURATION_MS).toISOString()
    : session!.cooldownUntil;
  const isExpired = now >= new Date(expiresAt).getTime();

  const record: UserTimerRecord = {
    id: session?.id,
    ip: ipHash,
    clientIdentifier: normalizedIdentifier,
    firstAccessAt,
    expiresAt,
    cooldownUntil,
    isExpired,
  };
  const values = {
    ip: ipHash,
    user_agent: null,
    client_identifier: normalizedIdentifier,
    first_access_at: firstAccessAt,
    expires_at: expiresAt,
    cooldown_until: cooldownUntil,
    is_expired: isExpired,
    updated_at: new Date().toISOString(),
  };

  let write = session?.id
    ? await supabase.from('offer_timer_sessions').update(values).eq('id', session.id).select('id').maybeSingle()
    : await supabase.from('offer_timer_sessions').insert(values).select('id').maybeSingle();

  // Duas requisições simultâneas do mesmo visitante: a segunda perde a corrida do UNIQUE e reaproveita a sessão criada.
  if (!session?.id && write.error?.code === '23505') {
    const existing = await supabase
      .from('offer_timer_sessions')
      .select('id, first_access_at, expires_at, cooldown_until, is_expired')
      .eq('client_identifier', normalizedIdentifier)
      .maybeSingle();
    if (existing.data) {
      const reused: UserTimerRecord = {
        id: existing.data.id,
        ip: ipHash,
        clientIdentifier: normalizedIdentifier,
        firstAccessAt: existing.data.first_access_at,
        expiresAt: existing.data.expires_at,
        cooldownUntil: existing.data.cooldown_until,
        isExpired: now >= new Date(existing.data.expires_at).getTime() || existing.data.is_expired,
      };
      updateMemoryCache(reused);
      return reused;
    }
  }

  if (write.error || !write.data) {
    console.error('[offerPricing] Falha ao salvar o cronômetro:', write.error?.message);
    throw new Error('Não foi possível salvar o cronômetro da oferta.');
  }
  record.id = write.data.id;
  updateMemoryCache(record);
  return record;
}
