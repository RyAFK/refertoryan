import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';

/**
 * Bypasses Row Level Security entirely. Never import this file into any
 * module that could end up in a Client Component bundle, and never use it
 * to answer a user-facing data request — only for:
 *   - rate-limit / login-attempt bookkeeping (login_attempts has no RLS
 *     policies at all, by design, so only this client can touch it)
 *   - audit-event writes that must succeed regardless of the acting user's
 *     own row-level permissions
 *   - system/administrative operations explicitly gated by an authz check
 *     performed *before* this client is used
 */
export function createServiceRoleClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    throw new Error('Supabase service-role credentials are not configured.');
  }

  return createSupabaseClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
