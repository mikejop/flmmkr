import { createClient, SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gnqqaskurjkrllnhjygt.supabase.co';
const DEFAULT_SUPABASE_SERVICE_KEY = 'dummy-service-role-key-for-build';

let _supabaseAdmin: SupabaseClient | null = null;

export const getSupabaseAdmin = (): SupabaseClient => {
  if (!_supabaseAdmin) {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SUPABASE_SERVICE_KEY;

    _supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
};

/**
 * Supabase Admin Client (Service-Role)
 * Exclusivamente para rotas de servidor e webhooks.
 * Bypasses RLS para criação de usuários auth e inserção de leads.
 * Utiliza Proxy para inicialização sob demanda (lazy initialization),
 * evitando erros durante o build do Next.js/Vercel caso as variáveis
 * não estejam injetadas na fase estática.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
