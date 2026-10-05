import { createClient } from '@/utils/supabase/client';
import { SupabaseClient } from '@supabase/supabase-js';

let _supabaseClient: SupabaseClient | null = null;

export const getSupabaseClient = () => {
  if (!_supabaseClient) {
    _supabaseClient = createClient();
  }
  return _supabaseClient;
};

export const supabase = new Proxy({} as SupabaseClient, {
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
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
