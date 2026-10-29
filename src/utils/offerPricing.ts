import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { hashClientIp } from '@/utils/ipHash';
import { getCurrentBatchPrice, LOTE1_END_ISO, BLACK_NOVEMBER_START_ISO, BLACK_NOVEMBER_END_ISO } from './priceSchedule.ts';

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
  /** Quando a pessoa clicou num botão de compra: o cronômetro para nesse instante (só na Black November). */
  claimedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export const COOLDOWN_DURATION_MS = 36 * 60 * 60 * 1000; // 36 horas após expirar

// The database is authoritative; this short cache is keyed only by a random server cookie.
const sessionCache = new Map<string, UserTimerRecord>();

export { getCurrentBatchPrice, LOTE1_END_ISO, LOTE2_END_ISO, LOTE3_END_ISO, BLACK_NOVEMBER_START_ISO, BLACK_NOVEMBER_END_ISO } from './priceSchedule.ts';
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

const SESSION_COLUMNS = 'id, client_identifier, first_access_at, expires_at, cooldown_until, is_expired, claimed_at';

type SessionRow = {
  id: string;
  first_access_at: string;
  expires_at: string;
  cooldown_until: string;
  is_expired: boolean;
  claimed_at: string | null;
};

function toRecord(row: SessionRow, clientIdentifier: string, ipHash: string | null, now: number): UserTimerRecord {
  return {
    id: row.id,
    clientIdentifier,
    ip: ipHash,
    firstAccessAt: row.first_access_at,
    expiresAt: row.expires_at,
    cooldownUntil: row.cooldown_until,
    claimedAt: row.claimed_at,
    isExpired: !row.claimed_at && (now >= new Date(row.expires_at).getTime() || row.is_expired),
  };
}

/** Segundos restantes do cronômetro; depois do clique em comprar, fica parado no valor daquele instante. */
export function remainingOfferSeconds(record: UserTimerRecord, now: number): number {
  const reference = record.claimedAt ? new Date(record.claimedAt).getTime() : now;
  return Math.max(0, Math.floor((new Date(record.expiresAt).getTime() - reference) / 1000));
}

/**
 * Resolve e gerencia a sessão do cronômetro da oferta:
 *
 * 1. A sessão é localizada pelo identificador do cookie do servidor (client_identifier, único).
 * 2. Sem sessão, cria uma nova (duração conforme a fase de preço: 15, 10, 7 ou 3 minutos).
 * 3. COOLDOWN DE 36 HORAS: se o tempo acabar, o aluno fica sem a promoção por 36 h e depois o cronômetro recomeça.
 * 4. BLACK NOVEMBER: os 7 minutos valem uma vez só durante a campanha. Quem apaga o cookie e volta do mesmo
 *    aparelho (mesmo HMAC de IP + navegador, `deviceHash`) herda o cronômetro que já tinha, em vez de ganhar outro.
 */
export async function resolveOfferTimerSession(
  clientIdentifier: string,
  clientIp?: string | null,
  options: { now?: number; deviceHash?: string | null } = {},
): Promise<UserTimerRecord> {
  const normalizedIdentifier = clientIdentifier.trim();
  // Os chamadores passam o SHA-256 (64 caracteres hexadecimais) do cookie da oferta.
  if (!/^[a-f0-9]{64}$/i.test(normalizedIdentifier)) throw new Error('Sessão de oferta inválida.');
  const now = options.now ?? Date.now();
  const ipHash = hashClientIp(clientIp);
  const deviceHash = options.deviceHash || null;
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase não configurado para persistir a oferta.');

  let session = sessionCache.get(normalizedIdentifier) || null;
  if (!session) {
    const { data, error } = await supabase
      .from('offer_timer_sessions')
      .select(SESSION_COLUMNS)
      .eq('client_identifier', normalizedIdentifier)
      .order('first_access_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) throw new Error('Não foi possível carregar o cronômetro da oferta.');
    if (data) session = toRecord(data, normalizedIdentifier, ipHash, now);
  }

  const launchEnd = new Date(LOTE1_END_ISO).getTime();
  if (session && now < launchEnd) {
    session.isExpired = false;
    return session;
  }

  // Cada fase de preço tem o seu cronômetro: quem entra numa fase nova (ou volta depois do período de espera) ganha um novo.
  const currentPhase = getCurrentBatchPrice(new Date(now));
  const isBlack = currentPhase.phaseId === 'black';
  const timerMs = Math.max(1, currentPhase.timerMinutes) * 60 * 1000;

  // Cookie novo na Black November: procura o cronômetro que este aparelho já recebeu na campanha.
  let base = session;
  if (!base && isBlack && deviceHash) {
    const { data } = await supabase
      .from('offer_timer_sessions')
      .select(SESSION_COLUMNS)
      .eq('device_hash', deviceHash)
      .gte('first_access_at', new Date(BLACK_NOVEMBER_START_ISO).toISOString())
      .order('first_access_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) base = toRecord(data, normalizedIdentifier, ipHash, now);
  }

  const basePhase = base ? getCurrentBatchPrice(new Date(base.firstAccessAt)).phaseId : null;
  const shouldStart = !base || now >= new Date(base.cooldownUntil).getTime() ||
    basePhase !== currentPhase.phaseId;
  const firstAccessAt = shouldStart ? new Date(now).toISOString() : base!.firstAccessAt;
  const expiresAt = shouldStart ? new Date(now + timerMs).toISOString() : base!.expiresAt;
  // Na Black November não há segunda chance: a espera vai até o fim da campanha.
  const cooldownUntil = !shouldStart
    ? base!.cooldownUntil
    : isBlack
      ? new Date(BLACK_NOVEMBER_END_ISO).toISOString()
      : new Date(now + timerMs + COOLDOWN_DURATION_MS).toISOString();
  const claimedAt = shouldStart ? null : base!.claimedAt || null;
  const isExpired = !claimedAt && now >= new Date(expiresAt).getTime();

  const record: UserTimerRecord = {
    id: session?.id,
    ip: ipHash,
    clientIdentifier: normalizedIdentifier,
    firstAccessAt,
    expiresAt,
    cooldownUntil,
    claimedAt,
    isExpired,
  };
  const values = {
    ip: ipHash,
    user_agent: null,
    device_hash: deviceHash,
    client_identifier: normalizedIdentifier,
    first_access_at: firstAccessAt,
    expires_at: expiresAt,
    cooldown_until: cooldownUntil,
    claimed_at: claimedAt,
    is_expired: isExpired,
    updated_at: new Date().toISOString(),
  };

  const write = session?.id
    ? await supabase.from('offer_timer_sessions').update(values).eq('id', session.id).select('id').maybeSingle()
    : await supabase.from('offer_timer_sessions').insert(values).select('id').maybeSingle();

  // Duas requisições simultâneas do mesmo visitante: a segunda perde a corrida do UNIQUE e reaproveita a sessão criada.
  if (!session?.id && write.error?.code === '23505') {
    const existing = await supabase
      .from('offer_timer_sessions')
      .select(SESSION_COLUMNS)
      .eq('client_identifier', normalizedIdentifier)
      .maybeSingle();
    if (existing.data) {
      const reused = toRecord(existing.data, normalizedIdentifier, ipHash, now);
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

/**
 * Clique num botão de compra durante a Black November: congela o cronômetro da pessoa (se ainda estiver valendo).
 * O preço de R$ 67 continua garantido para ela no checkout.
 */
export async function claimOfferTimer(
  clientIdentifier: string,
  clientIp?: string | null,
  options: { now?: number; deviceHash?: string | null } = {},
): Promise<UserTimerRecord> {
  const now = options.now ?? Date.now();
  const session = await resolveOfferTimerSession(clientIdentifier, clientIp, { ...options, now });
  if (getCurrentBatchPrice(new Date(now)).phaseId !== 'black' || session.isExpired || session.claimedAt || !session.id) {
    return session;
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error('Supabase não configurado para persistir a oferta.');
  const claimedAt = new Date(now).toISOString();
  const { data, error } = await supabase
    .from('offer_timer_sessions')
    .update({ claimed_at: claimedAt, updated_at: new Date().toISOString() })
    .eq('id', session.id)
    .is('claimed_at', null)
    .gt('expires_at', claimedAt)
    .select(SESSION_COLUMNS)
    .maybeSingle();
  if (error) throw new Error('Não foi possível registrar o clique na oferta.');
  if (!data) return session;
  const record = toRecord(data, session.clientIdentifier!, session.ip, now);
  updateMemoryCache(record);
  return record;
}

/** Identifica o aparelho sem guardar dados em claro: HMAC de IP + navegador. Sem IP (ou sem segredo), null. */
export function hashOfferDevice(clientIp: string | null | undefined, userAgent: string | null | undefined): string | null {
  if (!clientIp) return null;
  return hashClientIp(`${clientIp}|${(userAgent || '').slice(0, 512)}`);
}
