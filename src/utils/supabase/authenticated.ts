import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/** Resolve identity from the signed Supabase session cookie, never from request data. */
export async function getAuthenticatedUser() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { supabase, user: null };
  return { supabase, user: data.user };
}
