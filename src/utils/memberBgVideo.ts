import { createClient } from '@supabase/supabase-js';

export interface BgVideoSessionRecord {
  id?: string;
  macAddress: string;
  ip: string;
  userId?: string | null;
  clientIdentifier: string;
  finishedAt: string;
  resetAt: string;
  isFrozen: boolean;
}

export const BG_VIDEO_INTERVAL_MS = 72 * 60 * 60 * 1000; // 72 horas

// Cache em memória de alta performance com indexação por MAC, IP e userId
const macMemoryCache = new Map<string, BgVideoSessionRecord>();
const ipMemoryCache = new Map<string, BgVideoSessionRecord>();
const userMemoryCache = new Map<string, BgVideoSessionRecord>();

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

function updateMemoryCache(record: BgVideoSessionRecord) {
  if (record.macAddress) macMemoryCache.set(record.macAddress, record);
  if (record.ip) ipMemoryCache.set(record.ip, record);
  if (record.userId) userMemoryCache.set(record.userId, record);
}

/**
 * Consulta o status do vídeo de background da área de membros para o usuário.
 * Retorna se deve ficar congelado no último frame (isFrozen = true) ou se pode tocar/resetar.
 */
export async function getBgVideoSessionStatus(params: {
  macAddress?: string;
  ip: string;
  userId?: string | null;
}): Promise<{ isFrozen: boolean; resetAt: string | null }> {
  const { macAddress, ip, userId } = params;
  const now = Date.now();
  const supabase = getSupabaseAdmin();

  let session: BgVideoSessionRecord | null = null;

  // 1. Prioridade: userId autenticado
  if (userId) {
    session = userMemoryCache.get(userId) || null;
    if (!session && supabase) {
      try {
        const { data } = await supabase
          .from('member_bg_video_sessions')
          .select('*')
          .eq('user_id', userId)
          .order('finished_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          session = {
            id: data.id,
            macAddress: data.mac_address,
            ip: data.ip,
            userId: data.user_id,
            clientIdentifier: data.client_identifier,
            finishedAt: data.finished_at,
            resetAt: data.reset_at,
            isFrozen: new Date(data.reset_at).getTime() > now
          };
          updateMemoryCache(session);
        }
      } catch (err: any) {
        console.warn('[BgVideo] Erro busca userId:', err?.message || err);
      }
    }
  }

  // 2. Prioridade: MAC Address (impressão digital de hardware)
  if (!session && macAddress) {
    session = macMemoryCache.get(macAddress) || null;
    if (!session && supabase) {
      try {
        const { data } = await supabase
          .from('member_bg_video_sessions')
          .select('*')
          .eq('mac_address', macAddress)
          .order('finished_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          session = {
            id: data.id,
            macAddress: data.mac_address,
            ip: data.ip,
            userId: data.user_id,
            clientIdentifier: data.client_identifier,
            finishedAt: data.finished_at,
            resetAt: data.reset_at,
            isFrozen: new Date(data.reset_at).getTime() > now
          };
          updateMemoryCache(session);
        }
      } catch (err: any) {
        console.warn('[BgVideo] Erro busca MAC:', err?.message || err);
      }
    }
  }

  // 3. Fallback: IP
  if (!session && ip) {
    session = ipMemoryCache.get(ip) || null;
    if (!session && supabase) {
      try {
        const { data } = await supabase
          .from('member_bg_video_sessions')
          .select('*')
          .eq('ip', ip)
          .order('finished_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data) {
          session = {
            id: data.id,
            macAddress: data.mac_address,
            ip: data.ip,
            userId: data.user_id,
            clientIdentifier: data.client_identifier,
            finishedAt: data.finished_at,
            resetAt: data.reset_at,
            isFrozen: new Date(data.reset_at).getTime() > now
          };
          updateMemoryCache(session);
        }
      } catch (err: any) {
        console.warn('[BgVideo] Erro busca IP:', err?.message || err);
      }
    }
  }

  if (!session) {
    return { isFrozen: false, resetAt: null };
  }

  const resetTime = new Date(session.resetAt).getTime();
  if (now >= resetTime) {
    // 72 horas se passaram -> reseta!
    return { isFrozen: false, resetAt: null };
  }

  return { isFrozen: true, resetAt: session.resetAt };
}

/**
 * Registra o término da reprodução do vídeo de background (ao chegar no fim).
 * Define que ficará congelado e só resetará após 72 horas.
 */
export async function recordBgVideoFinished(params: {
  macAddress?: string;
  ip: string;
  userId?: string | null;
}): Promise<{ isFrozen: boolean; resetAt: string }> {
  const { macAddress, ip, userId } = params;
  const now = Date.now();
  const finishedAt = new Date(now).toISOString();
  const resetAt = new Date(now + BG_VIDEO_INTERVAL_MS).toISOString();

  const clientIdentifier = userId
    ? `usr_${userId}`
    : (macAddress ? `mac_${macAddress}` : `ip_${ip.replace(/[^a-zA-Z0-9]/g, '_')}`);

  const record: BgVideoSessionRecord = {
    macAddress: macAddress || 'unknown_mac',
    ip,
    userId: userId || null,
    clientIdentifier,
    finishedAt,
    resetAt,
    isFrozen: true
  };

  updateMemoryCache(record);

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      await supabase
        .from('member_bg_video_sessions')
        .upsert(
          {
            mac_address: record.macAddress,
            ip: record.ip,
            user_id: record.userId,
            client_identifier: record.clientIdentifier,
            finished_at: finishedAt,
            reset_at: resetAt,
            updated_at: finishedAt
          },
          { onConflict: 'client_identifier' }
        );
    } catch (err: any) {
      console.warn('[BgVideo] Erro ao salvar término:', err?.message || err);
    }
  }

  return { isFrozen: true, resetAt };
}
