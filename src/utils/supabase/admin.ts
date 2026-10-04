import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Supabase Admin Client (Service-Role)
 * Exclusivamente para rotas de servidor e webhooks.
 * Bypasses RLS para criação de usuários auth e inserção de leads.
 */
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseSecretKey || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
