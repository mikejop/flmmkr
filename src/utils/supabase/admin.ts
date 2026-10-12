import 'server-only';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

function resolveUrl(): string {
  const envUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof envUrl === 'string') {
    const trimmed = envUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }
  throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_URL deve ser configurada no servidor.');
}

function resolveKey(): string {
  const envKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (typeof envKey === 'string') {
    const trimmed = envKey.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ou SUPABASE_SECRET_KEY deve ser configurada no servidor.');
}

function resolveAnonKey(): string {
  const envKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';
  if (typeof envKey === 'string') {
    const trimmed = envKey.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  throw new Error('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY deve ser configurada para autenticação isolada.');
}

let _supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(resolveUrl(), resolveKey(), {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
};

/**
 * Cria um cliente isolado para autenticação de usuário (signInWithPassword).
 * Evita que o client admin (service_role) tenha seus headers sobrescritos pelo JWT do usuário.
 */
export const createIsolatedAuthClient = (): SupabaseClient => {
  return createClient(resolveUrl(), resolveAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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
