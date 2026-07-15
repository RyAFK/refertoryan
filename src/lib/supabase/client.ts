'use client';

import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client. Only ever used for the auth SDK calls that must
 * run client-side (password sign-in, MFA challenge/verify, sign-out) so the
 * auth cookies are set correctly by the browser. Never fetch clinical or
 * patient data with this client directly from a Client Component — that
 * data flows through Server Components / Server Actions per §1.
 */
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase URL/anon key are not configured.');
  }

  return createBrowserClient(url, anonKey);
}
