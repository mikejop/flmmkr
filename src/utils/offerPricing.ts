import 'server-only';
import { createClient } from '@supabase/supabase-js';

export interface UserTimerRecord {
  id?: string;
  macAddress: string;
  ip: string;
  clientIdentifier?: string;
  userAgent?: string;
  firstAccessAt: string;
  expiresAt: string;
  cooldownUntil: string;
  isExpired: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const TIMER_DURATION_MS = 15 * 60 * 1000; // 15 minutos
export const COOLDOWN_DURATION_MS = 36 * 60 * 60 * 1000; // 36 horas após expirar

// The database is authoritative; this short cache is keyed only by a random server cookie.
const sessionCache = new Map<string, UserTimerRecord>();

export interface BatchPriceInfo {
  promoPrice: number;
  currentBatchPrice: number;
  regularPrice: number;
  batchName: string;
  nextPriceDate?: string;
  isLaunchPhase: boolean;
}

export const LOTE1_END_ISO = '2026-10-09T23:59:59-03:00';
export const LOTE2_END_ISO = '2026-10-13T23:59:59-03:00';
export const LOTE3_END_ISO = '2026-10-17T23:59:59-03:00';

/**
 * Função para calcular o preço promocional de acordo com as datas dos lotes:
 * - Até 09/10/2026 (Sexta-feira 23:59:59): R$ 95 (Lote Especial de Lançamento - Sem cronômetro de 15 min)
 * - De 10/10/2026 até 13/10/2026 (Terça-feira 23:59:59): R$ 125 (2º Lote - Cronômetro de 15 min para garantir R$ 95)
 * - De 14/10/2026 até 17/10/2026 (Sábado 23:59:59): R$ 150 (3º Lote - Cronômetro de 15 min para garantir R$ 95)
 * - A partir de 18/10/2026: R$ 195 (Preço Oficial Regular - Cronômetro de 15 min para garantir R$ 95)
 */
export function getCurrentBatchPrice(now: Date = new Date()): BatchPriceInfo {
  const regularPrice = 195;
  const currentYear = now.getFullYear();

  const refDate = new Date(now);
  if (currentYear < 2026) {
    refDate.setFullYear(2026);
  }

  const lote1End = new Date(LOTE1_END_ISO);
  const lote2End = new Date(LOTE2_END_ISO);
  const lote3End = new Date(LOTE3_END_ISO);

  // 1. Fase de Lançamento: Até 09/10/2026 às 23:59:59
  if (refDate <= lote1End) {
    return {
      promoPrice: 95,
      currentBatchPrice: 95,
      regularPrice,
      batchName: 'Lote Especial de Lançamento',
      nextPriceDate: '09/10/2026',
      isLaunchPhase: true
    };
  }

  // 2. 2º Lote: De 10/10/2026 até 13/10/2026 às 23:59:59
  if (refDate <= lote2End) {
    return {
      promoPrice: 95,
      currentBatchPrice: 125,
      regularPrice,
      batchName: '2º Lote Promocional',
      nextPriceDate: '13/10/2026',
      isLaunchPhase: false
    };
  }

  // 3. 3º Lote: De 14/10/2026 até 17/10/2026 às 23:59:59
  if (refDate <= lote3End) {
    return {
      promoPrice: 95,
      currentBatchPrice: 150,
      regularPrice,
      batchName: '3º Lote Promocional',
      nextPriceDate: '17/10/2026',
      isLaunchPhase: false
    };
  }

  // 4. Preço Oficial Regular: A partir de 18/10/2026
  return {
    promoPrice: 95,
    currentBatchPrice: regularPrice,
    regularPrice,
    batchName: 'Preço Oficial Regular',
    isLaunchPhase: false
  };
}

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
 * Atualiza o cache local em memória para MAC e IP
 */
function updateMemoryCache(record: UserTimerRecord) {
  if (record.clientIdentifier) sessionCache.set(record.clientIdentifier, record);
}

/**
 * Resolve e gerencia a sessão do cronômetro com base na hierarquia estrita:
 * 
 * 1. PRIORIDADE MÁXIMA: mac_address (impressão digital do computador).
 *    Se o usuário mudar de internet/Wi-Fi, o site reconhece o mac_address e mantém o timer ativo.
 * 2. SEGUNDA PRIORIDADE: IP.
 *    Se outra pessoa usar o mesmo IP, ela vê o mesmo timer dos outros usuários da mesma rede.
 * 3. Se nenhuma existir, cria uma nova sessão vinculando o MAC e o IP.
 * 4. COOLDOWN DE 36 HORAS:
 *    Se o tempo acabar (00:00), o usuário fica sem a promoção durante 36h.
 *    Após exatamente 36 horas após zerar, o sistema silenciosamente reseta o cronômetro no backend.
 */
export async function resolveOfferTimerSession(clientIdentifier: string): Promise<UserTimerRecord> {
  const normalizedIdentifier = clientIdentifier.trim();
  if (!/^[a-f0-9-]{36}$/i.test(normalizedIdentifier)) throw new Error('Sessão de oferta inválida.');
  const now = Date.now();
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
        macAddress: '',
        ip: '',
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

  const shouldStart = !session || now >= new Date(session.cooldownUntil).getTime() ||
    new Date(session.firstAccessAt).getTime() <= launchEnd;
  const firstAccessAt = shouldStart ? new Date(now).toISOString() : session!.firstAccessAt;
  const expiresAt = shouldStart ? new Date(now + TIMER_DURATION_MS).toISOString() : session!.expiresAt;
  const cooldownUntil = shouldStart
    ? new Date(now + TIMER_DURATION_MS + COOLDOWN_DURATION_MS).toISOString()
    : session!.cooldownUntil;
  const isExpired = now >= new Date(expiresAt).getTime();

  const record: UserTimerRecord = {
    id: session?.id,
    macAddress: '',
    ip: '',
    clientIdentifier: normalizedIdentifier,
    firstAccessAt,
    expiresAt,
    cooldownUntil,
    isExpired,
  };
  const values = {
    mac_address: null,
    ip: null,
    user_agent: null,
    client_identifier: normalizedIdentifier,
    first_access_at: firstAccessAt,
    expires_at: expiresAt,
    cooldown_until: cooldownUntil,
    is_expired: isExpired,
    updated_at: new Date().toISOString(),
  };

  const write = session?.id
    ? await supabase.from('offer_timer_sessions').update(values).eq('id', session.id).select('id').maybeSingle()
    : await supabase.from('offer_timer_sessions').insert(values).select('id').maybeSingle();
  if (write.error || !write.data) throw new Error('Não foi possível salvar o cronômetro da oferta.');
  record.id = write.data.id;
  updateMemoryCache(record);
  return record;
}
