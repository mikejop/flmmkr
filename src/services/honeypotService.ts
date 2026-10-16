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
export const BLOCK_DURATION_MS = 60 * 60 * 1000; // bloqueio temporário de 1 hora
const bannedIpsCache = new Map<string, number>(); // ip -> expira em (ms)
let lastCacheSync = 0;

function isCachedBlock(ip: string): boolean {
  const until = bannedIpsCache.get(ip);
  if (!until) return false;
  if (until <= Date.now()) {
    bannedIpsCache.delete(ip);
    return false;
  }
  return true;
}

/** Expande um IPv6 (com "::") para 8 grupos de 4 dígitos; null se não for IPv6 válido. */
function expandIpv6(ip: string): string[] | null {
  if (!ip.includes(':')) return null;
  const [head, tail] = ip.split('::');
  const h = head ? head.split(':') : [];
  const t = tail !== undefined && tail ? tail.split(':') : [];
  const missing = 8 - h.length - t.length;
  if (ip.includes('::') ? missing < 0 : h.length !== 8) return null;
  const groups = [...h, ...(ip.includes('::') ? Array(missing).fill('0') : []), ...t];
  return groups.length === 8 ? groups.map((g) => g.toLowerCase().padStart(4, '0')) : null;
}

/**
 * IPs do dono/testador que NUNCA são bloqueados pelo honeypot (variável HONEYPOT_ALLOWLIST_IPS, separada por vírgula).
 * Aceita IPv4 exato, IPv6 exato e IPv6 com prefixo "/64" (endereços IPv6 temporários mudam só os últimos 64 bits).
 */
export function isAllowlistedIp(ip: string): boolean {
  const clean = (ip || '').trim().toLowerCase();
  if (!clean) return false;
  const entries = (process.env.HONEYPOT_ALLOWLIST_IPS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  for (const entry of entries) {
    if (entry === clean) return true;
    if (entry.endsWith('/64')) {
      const prefix = expandIpv6(entry.slice(0, -3));
      const candidate = expandIpv6(clean);
      if (prefix && candidate && prefix.slice(0, 4).join(':') === candidate.slice(0, 4).join(':')) return true;
    }
  }
  return false;
}

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
 * Registra o bloqueio temporário (1 hora) no banco e no cache em memória
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
  if (isAllowlistedIp(cleanIp)) return; // IP do dono/testador: nunca bloqueia
  const cleanMac = (mac || '').trim();
  const expiresAt = new Date(Date.now() + BLOCK_DURATION_MS);

  if (cleanIp) bannedIpsCache.set(cleanIp, expiresAt.getTime());

  console.warn('[HONEYPOT TRIGGERED] Registro de segurança criado.');

  try {
    await supabaseAdmin.from('blocked_attackers').insert({
      ip_address: cleanIp || 'UNKNOWN',
      mac_address: cleanMac || null,
      device_fingerprint: fingerprint || null,
      honeypot_triggered: honeypotPath,
      user_agent: userAgent || null,
      request_headers: headers || null,
      is_banned: true,
      expires_at: expiresAt.toISOString(),
      notes: `Rota honeypot ${honeypotPath} acionada. Bloqueio temporário de 1 hora.`
    });
  } catch (err) {
    console.error('[Honeypot Service] Erro ao registrar banimento no Supabase:', err);
  }
}

/**
 * Verifica se o IP está com bloqueio temporário ativo
 */
export async function isAttackerBanned({
  ip
}: {
  ip: string;
  mac?: string;
}): Promise<boolean> {
  // O cookie "flmmkr_banned" deixou de valer: ele era permanente, forjável e prendia o próprio dono do site.
  // A decisão vem só do IP (cache em memória + tabela com validade).
  const cleanIp = (ip || '').trim();
  if (isAllowlistedIp(cleanIp)) return false;

  // 2. Checagem ultra-rápida em memória
  if (cleanIp && isCachedBlock(cleanIp)) return true;

  // 3. Sincronização com o banco a cada 60s (só bloqueios ainda válidos)
  const now = Date.now();
  if (now - lastCacheSync > 60000) {
    lastCacheSync = now;
    try {
      const { data: bannedList } = await supabaseAdmin
        .from('blocked_attackers')
        .select('ip_address, expires_at')
        .eq('is_banned', true)
        .gt('expires_at', new Date().toISOString())
        .limit(2000);

      for (const item of bannedList || []) {
        if (item.ip_address && item.expires_at) {
          bannedIpsCache.set(item.ip_address, new Date(item.expires_at).getTime());
        }
      }
    } catch (dbErr) {
      console.error('[Honeypot Service] Erro ao sincronizar cache de bloqueios:', dbErr);
    }
  }

  return !!cleanIp && isCachedBlock(cleanIp);
}

/**
 * Recursos carregados automaticamente pelo navegador (imagem, script, CSS, fonte, iframe, mídia...)
 * nunca disparam o honeypot. Só navegação de documento ou chamada direta (sem Sec-Fetch-Dest) conta.
 */
export function isAutoLoadedResource(headers: Headers): boolean {
  const dest = (headers.get('sec-fetch-dest') || '').toLowerCase();
  if (dest && dest !== 'document' && dest !== 'empty') return true;
  const accept = (headers.get('accept') || '').toLowerCase();
  return !dest && /^(image|video|audio)\//.test(accept.split(',')[0] || '');
}
