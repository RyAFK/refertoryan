import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { env } from '@/lib/env';

/**
 * Supabase client for Server Components / Server Actions / Route Handlers.
 * Runs with the caller's session (via cookies) and is therefore still
 * subject to RLS — this is NOT a privileged client. Use createServiceRoleClient
 * only for the small set of server-only operations that must bypass RLS
 * (rate-limit bookkeeping, audit writes attributed to system events).
 */
export async function createClient() {
  const cookieStore = await cookies();

  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase URL/anon key are not configured.');
  }

  return createServerClient(env.supabaseUrl, env.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Called from a Server Component render, where cookies can't be
          // set. Harmless as long as src/middleware.ts is also refreshing
          // the session on every request.
        }
      },
    },
  });
}
