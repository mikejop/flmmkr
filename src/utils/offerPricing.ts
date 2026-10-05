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

// Cache em memória de alta performance com indexação dupla (MAC e IP)
const macMemoryCache = new Map<string, UserTimerRecord>();
const ipMemoryCache = new Map<string, UserTimerRecord>();

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
 * Supabase Admin Client (Service Role - Acesso restrito ao backend)
 */
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && secret) {
    return createClient(url, secret, {
      auth: { persistSession: false }
    });
  }
  return null;
}

/**
 * Atualiza o cache local em memória para MAC e IP
 */
function updateMemoryCache(record: UserTimerRecord) {
  if (record.macAddress) {
    macMemoryCache.set(record.macAddress, record);
  }
  if (record.ip) {
    ipMemoryCache.set(record.ip, record);
  }
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
export async function resolveOfferTimerSession(params: {
  macAddress: string;
  ip: string;
  userAgent?: string;
}): Promise<UserTimerRecord> {
  const { macAddress, ip, userAgent } = params;
  const now = Date.now();
  const supabase = getSupabaseAdmin();

  let session: UserTimerRecord | null = null;
  let foundByMac = false;

  // 1. PRIORIDADE 1: Buscar por MAC Address (Impressão Digital do Computador)
  if (macAddress) {
    session = macMemoryCache.get(macAddress) || null;

    if (!session && supabase) {
      try {
        const { data, error } = await supabase
          .from('offer_timer_sessions')
          .select('*')
          .eq('mac_address', macAddress)
          .order('first_access_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          session = {
            id: data.id,
            macAddress: data.mac_address,
            ip: data.ip,
            clientIdentifier: data.client_identifier,
            userAgent: data.user_agent,
            firstAccessAt: data.first_access_at,
            expiresAt: data.expires_at,
            cooldownUntil: data.cooldown_until,
            isExpired: data.is_expired
          };
          updateMemoryCache(session);
        }
      } catch (err: any) {
        console.warn('[Timer] Erro na busca por MAC:', err?.message || err);
      }
    }

    if (session) {
      foundByMac = true;
      // Se o usuário mudou de internet/Wi-Fi, atualizar o IP registrado para manter rastreabilidade
      if (session.ip !== ip) {
        session.ip = ip;
        updateMemoryCache(session);
        if (supabase) {
          try {
            await supabase
              .from('offer_timer_sessions')
              .update({ ip, updated_at: new Date().toISOString() })
              .eq('mac_address', macAddress);
          } catch {}
        }
      }
    }
  }

  // 2. PRIORIDADE 2: Se não encontrou por MAC, buscar por IP da rede
  if (!session && ip) {
    session = ipMemoryCache.get(ip) || null;

    if (!session && supabase) {
      try {
        const { data, error } = await supabase
          .from('offer_timer_sessions')
          .select('*')
          .eq('ip', ip)
          .order('first_access_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          session = {
            id: data.id,
            macAddress: data.mac_address,
            ip: data.ip,
            clientIdentifier: data.client_identifier,
            userAgent: data.user_agent,
            firstAccessAt: data.first_access_at,
            expiresAt: data.expires_at,
            cooldownUntil: data.cooldown_until,
            isExpired: data.is_expired
          };
          updateMemoryCache(session);
        }
      } catch (err: any) {
        console.warn('[Timer] Erro na busca por IP:', err?.message || err);
      }
    }
  }

  // 3. SE EXISTIR SESSÃO: Verificar o Cooldown de 36 Horas para Reset Silencioso
  if (session) {
    const cooldownTime = new Date(session.cooldownUntil).getTime();

    // Se já passaram as 36 horas após o cronômetro zerar, reseta silenciosamente
    if (now >= cooldownTime) {
      const firstAccessAt = new Date(now).toISOString();
      const expiresAt = new Date(now + TIMER_DURATION_MS).toISOString();
      const cooldownUntil = new Date(now + TIMER_DURATION_MS + COOLDOWN_DURATION_MS).toISOString();

      session = {
        ...session,
        macAddress: macAddress || session.macAddress,
        ip,
        userAgent: userAgent || session.userAgent,
        firstAccessAt,
        expiresAt,
        cooldownUntil,
        isExpired: false
      };

      updateMemoryCache(session);

      if (supabase) {
        try {
          await supabase
            .from('offer_timer_sessions')
            .update({
              first_access_at: firstAccessAt,
              expires_at: expiresAt,
              cooldown_until: cooldownUntil,
              is_expired: false,
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);
        } catch {}
      }

      return session;
    }

    // Se ainda está dentro do período (seja ativo ou bloqueado nas 36h)
    const expiresAtTime = new Date(session.expiresAt).getTime();
    const isExpired = now >= expiresAtTime;

    if (isExpired !== session.isExpired) {
      session.isExpired = isExpired;
      updateMemoryCache(session);
      if (supabase) {
        try {
          await supabase
            .from('offer_timer_sessions')
            .update({ is_expired: isExpired, updated_at: new Date().toISOString() })
            .eq('id', session.id);
        } catch {}
      }
    }

    return session;
  }

  // 4. SE NÃO EXISTIA: Criar uma nova sessão vinculada ao MAC e IP
  const firstAccessAt = new Date(now).toISOString();
  const expiresAt = new Date(now + TIMER_DURATION_MS).toISOString();
  // Cooldown de 36 horas inicia após os 15 minutos do cronômetro zerarem
  const cooldownUntil = new Date(now + TIMER_DURATION_MS + COOLDOWN_DURATION_MS).toISOString();
  const clientIdentifier = `${macAddress || 'dev'}_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const newRecord: UserTimerRecord = {
    macAddress: macAddress || `mac_anon_${Date.now()}`,
    ip,
    clientIdentifier,
    userAgent,
    firstAccessAt,
    expiresAt,
    cooldownUntil,
    isExpired: false
  };

  updateMemoryCache(newRecord);

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('offer_timer_sessions')
        .insert({
          mac_address: newRecord.macAddress,
          ip: newRecord.ip,
          client_identifier: newRecord.clientIdentifier,
          user_agent: newRecord.userAgent,
          first_access_at: newRecord.firstAccessAt,
          expires_at: newRecord.expiresAt,
          cooldown_until: newRecord.cooldownUntil,
          is_expired: false
        })
        .select()
        .maybeSingle();

      if (!error && data) {
        newRecord.id = data.id;
        updateMemoryCache(newRecord);
      }
    } catch (err: any) {
      console.warn('[Timer] Erro ao persistir nova sessão:', err?.message || err);
    }
  }

  return newRecord;
}
