import 'server-only';
import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Session } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://gnqqaskurjkrllnhjygt.supabase.co';
const DEFAULT_PUBLISHABLE_KEY = 'dummy-anon-key-for-build';

/** Persist an authenticated Supabase session in the SSR cookie format. */
export async function writeSupabaseSessionCookies(
  request: NextRequest,
  response: NextResponse,
  session: Session,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_PUBLISHABLE_KEY;
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, {
            ...options,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          });
        });
      },
    },
  });

  const { error } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (error) throw error;
  return response;
}
