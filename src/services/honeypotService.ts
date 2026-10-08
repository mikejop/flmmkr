import { supabaseAdmin } from '@/utils/supabase/admin';

// Lista de rotas e padrões clássicos de honeypot e varredura maliciosa
export const HONEYPOT_PATHS = [
  // WordPress & CMS probes
  '/wp-admin',
  '/wp-login.php',
  '/wp-login',
  '/xmlrpc.php',
  '/wp-content',
  '/wp-includes',
  
  // Sensitive files & environment leaks
  '/.env',
  '/.env.local',
  '/.env.production',
  '/.git',
  '/.git/config',
  '/.git/HEAD',
  '/.aws',
  '/.aws/credentials',
  '/.ssh',
  '/.ssh/id_rsa',
  '/.DS_Store',
  '/web.config',
  
  // Database & administration tools
  '/phpmyadmin',
  '/pma',
  '/adminer.php',
  '/adminer',
  '/mysql',
  '/myadmin',
  '/dump.sql',
  '/backup.sql',
  '/db.sql',
  '/database.sql',
  
  // Framework diagnostics & debuggers
  '/telescope',
  '/_profiler',
  '/actuator',
  '/actuator/health',
  '/api/debug',
  '/api/admin/dump',
  '/api/v1/dump',
  '/console',
  '/shell',
  '/eval',
  '/solr',
  
  // Honeypot específico da aplicação FLMMKR
  '/internal-metrics-v1',
  '/flmmkr-admin-trap'
];

// Cache em memória de alta performance para banimento instantâneo (zero delay)
const bannedIpsCache = new Set<string>();
const bannedMacsCache = new Set<string>();
let lastCacheSync = 0;

/**
 * Verifica se o caminho requisitado é um honeypot
 */
export function isHoneypotPath(pathname: string): boolean {
  if (!pathname) return false;
  const normalized = pathname.toLowerCase().trim();

  // Verifica correspondência exata ou prefixo de rotas protegidas
  return HONEYPOT_PATHS.some((trap) => {
    return normalized === trap || normalized.startsWith(`${trap}/`);
  });
}

/**
 * Registra o atacante no banco de dados e adiciona ao cache de bloqueio permanente
 */
export async function banAttacker({
  ip,
  mac,
  fingerprint,
  honeypotPath,
  userAgent,
  headers
}: {
  ip: string;
  mac?: string;
  fingerprint?: string;
  honeypotPath: string;
  userAgent?: string;
  headers?: Record<string, string>;
}): Promise<void> {
  const cleanIp = (ip || '').trim();
  const cleanMac = (mac || '').trim();

  if (cleanIp) bannedIpsCache.add(cleanIp);
  if (cleanMac) bannedMacsCache.add(cleanMac);

  console.warn(`[HONEYPOT TRIGGERED] Bloqueio INDEFINIDO aplicado para IP: ${cleanIp}, MAC: ${cleanMac}, Rota: ${honeypotPath}`);

  try {
    await supabaseAdmin.from('blocked_attackers').insert({
      ip_address: cleanIp || 'UNKNOWN',
      mac_address: cleanMac || null,
      device_fingerprint: fingerprint || null,
      honeypot_triggered: honeypotPath,
      user_agent: userAgent || null,
      request_headers: headers || null,
      is_banned: true,
      notes: `Atacante acessou a rota honeypot proibida ${honeypotPath}. Bloqueio global permanente.`
    });
  } catch (err) {
    console.error('[Honeypot Service] Erro ao registrar banimento no Supabase:', err);
  }
}

/**
 * Verifica se o IP, MAC ou fingerprint está banido indefinidamente
 */
export async function isAttackerBanned({
  ip,
  mac,
  fingerprint,
  hasBannedCookie
}: {
  ip: string;
  mac?: string;
  fingerprint?: string;
  hasBannedCookie?: boolean;
}): Promise<boolean> {
  // 1. Se tem o cookie indelével de banimento
  if (hasBannedCookie) return true;

  const cleanIp = (ip || '').trim();
  const cleanMac = (mac || '').trim();

  // 2. Checagem ultra-rápida em memória
  if (cleanIp && bannedIpsCache.has(cleanIp)) return true;
  if (cleanMac && bannedMacsCache.has(cleanMac)) return true;

  // 3. Sincronização periódica ou checagem no banco a cada 60s
  const now = Date.now();
  if (now - lastCacheSync > 60000) {
    lastCacheSync = now;
    try {
      const { data: bannedList } = await supabaseAdmin
        .from('blocked_attackers')
        .select('ip_address, mac_address')
        .eq('is_banned', true)
        .limit(2000);

      if (bannedList && bannedList.length > 0) {
        for (const item of bannedList) {
          if (item.ip_address) bannedIpsCache.add(item.ip_address);
          if (item.mac_address) bannedMacsCache.add(item.mac_address);
        }
      }
    } catch (dbErr) {
      console.error('[Honeypot Service] Erro ao sincronizar cache de banidos:', dbErr);
    }
  }

  // Checa novamente após sincronização
  if (cleanIp && bannedIpsCache.has(cleanIp)) return true;
  if (cleanMac && bannedMacsCache.has(cleanMac)) return true;

  return false;
}
