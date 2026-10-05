import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gnqqaskurjkrllnhjygt.supabase.co';
const DEFAULT_SUPABASE_SERVICE_KEY = 'dummy-service-role-key-for-build';

function resolveUrl(): string {
  const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof envUrl === 'string') {
    const trimmed = envUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveKey(): string {
  const envKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof envKey === 'string') {
    const trimmed = envKey.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_SERVICE_KEY;
}

let _supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    try {
      const supabaseUrl = resolveUrl();
      const supabaseSecretKey = resolveKey();

      _supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    } catch (err) {
      console.warn('[SupabaseAdmin] Falha ao inicializar client Supabase:', err);
      _supabaseAdmin = createClient(DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_SERVICE_KEY, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
    }
  }
  return _supabaseAdmin;
};

/**
 * Supabase Admin Client (Service-Role)
 * Exclusivamente para rotas de servidor e webhooks.
 * Bypasses RLS para criação de usuários auth e inserção de leads.
 * Utiliza Proxy para inicialização sob demanda (lazy initialization),
 * interceptando propriedades padrão (then, toJSON, __esModule, symbols)
 * para evitar qualquer avaliação acidental durante o build estático.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined;
    }
    if (prop === '__esModule') {
      return true;
    }
    if (prop === 'toJSON') {
      return () => ({});
    }
    if (typeof prop === 'symbol') {
      return undefined;
    }
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
