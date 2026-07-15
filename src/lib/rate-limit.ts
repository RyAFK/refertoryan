import { createServiceRoleClient } from '@/lib/supabase/service-role';

const EMAIL_WINDOW_MINUTES = 15;
const EMAIL_MAX_FAILURES = 5;
const IP_WINDOW_MINUTES = 60;
const IP_MAX_FAILURES = 20;

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: string; retryAfterSeconds: number };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Checked before attempting a password sign-in. Two independent limits:
 * per-email (classic brute-force against one account) and per-IP (credential
 * stuffing across many accounts from one source). Both consult the durable
 * login_attempts table so the limit holds across server instances, not just
 * in one process's memory.
 */
export async function checkLoginRateLimit(email: string, ipAddress: string | null): Promise<RateLimitResult> {
  const supabase = createServiceRoleClient();
  const normalizedEmail = normalizeEmail(email);
  const now = Date.now();

  const emailWindowStart = new Date(now - EMAIL_WINDOW_MINUTES * 60_000).toISOString();
  const { data: emailFailures, error: emailError } = await supabase
    .from('login_attempts')
    .select('created_at')
    .eq('email_normalized', normalizedEmail)
    .eq('outcome', 'failure')
    .gte('created_at', emailWindowStart)
    .order('created_at', { ascending: true });

  if (emailError) {
    // Fail closed on a rate-limit-check failure would lock everyone out on
    // a transient DB blip; fail open here but this failure itself is worth
    // alerting on operationally (not modelled yet - flagged as a follow-up).
    return { allowed: true };
  }

  if (emailFailures && emailFailures.length >= EMAIL_MAX_FAILURES) {
    const oldest = emailFailures[0];
    const retryAfterSeconds = oldest
      ? Math.max(0, Math.ceil((new Date(oldest.created_at).getTime() + EMAIL_WINDOW_MINUTES * 60_000 - now) / 1000))
      : EMAIL_WINDOW_MINUTES * 60;
    return {
      allowed: false,
      reason: 'too_many_attempts_for_account',
      retryAfterSeconds,
    };
  }

  if (ipAddress) {
    const ipWindowStart = new Date(now - IP_WINDOW_MINUTES * 60_000).toISOString();
    const { data: ipFailures } = await supabase
      .from('login_attempts')
      .select('created_at')
      .eq('ip_address', ipAddress)
      .eq('outcome', 'failure')
      .gte('created_at', ipWindowStart)
      .order('created_at', { ascending: true });

    if (ipFailures && ipFailures.length >= IP_MAX_FAILURES) {
      const oldest = ipFailures[0];
      const retryAfterSeconds = oldest
        ? Math.max(0, Math.ceil((new Date(oldest.created_at).getTime() + IP_WINDOW_MINUTES * 60_000 - now) / 1000))
        : IP_WINDOW_MINUTES * 60;
      return {
        allowed: false,
        reason: 'too_many_attempts_from_source',
        retryAfterSeconds,
      };
    }
  }

  return { allowed: true };
}

export async function recordLoginAttempt(
  email: string,
  ipAddress: string | null,
  outcome: 'success' | 'failure',
  reason?: string
): Promise<void> {
  const supabase = createServiceRoleClient();
  await supabase.from('login_attempts').insert({
    email_normalized: normalizeEmail(email),
    ip_address: ipAddress,
    outcome,
    reason: reason ?? null,
  });
}

/** Pure helper, exported separately so it's unit-testable without a DB. */
export function computeRetryAfterSeconds(oldestFailureIso: string, windowMinutes: number, now: number): number {
  return Math.max(0, Math.ceil((new Date(oldestFailureIso).getTime() + windowMinutes * 60_000 - now) / 1000));
}

export const RATE_LIMIT_CONFIG = {
  EMAIL_WINDOW_MINUTES,
  EMAIL_MAX_FAILURES,
  IP_WINDOW_MINUTES,
  IP_MAX_FAILURES,
};
