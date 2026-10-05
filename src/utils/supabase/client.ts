import { createBrowserClient } from "@supabase/ssr";

const DEFAULT_SUPABASE_URL = 'https://gnqqaskurjkrllnhjygt.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'dummy-anon-key-for-build';

function resolveUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (typeof envUrl === 'string') {
    const trimmed = envUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_URL;
}

function resolveKey(): string {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (typeof envKey === 'string') {
    const trimmed = envKey.trim();
    if (trimmed.length > 0 && trimmed !== 'undefined' && trimmed !== 'null') {
      return trimmed;
    }
  }
  return DEFAULT_SUPABASE_ANON_KEY;
}

export const createClient = () => {
  return createBrowserClient(resolveUrl(), resolveKey());
};
