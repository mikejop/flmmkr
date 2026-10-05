import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = 'https://gnqqaskurjkrllnhjygt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'dummy-anon-key-for-build';

export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return createBrowserClient(supabaseUrl, supabaseKey);
};
