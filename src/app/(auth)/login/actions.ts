'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, recordLoginAttempt } from '@/lib/rate-limit';
import { writeAuditEvent } from '@/lib/audit';
import { getRequestContext } from '@/lib/request-context';
import { sanitizeRedirectTarget } from '@/lib/safe-redirect';

/**
 * Deliberately generic: every failure path (unknown email, wrong password,
 * pending/suspended account, rate-limited) returns the same redirect with
 * the same error code, and the same message is shown to the user, so the
 * login page never discloses whether a given email has an account (§3).
 */
const GENERIC_ERROR = 'invalid_credentials';

export async function loginAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const redirectTo = sanitizeRedirectTarget(String(formData.get('redirectTo') ?? ''));
  const { ipAddress: ip, userAgent } = await getRequestContext();

  if (!email || !password) {
    redirect(`/login?error=${GENERIC_ERROR}`);
  }

  const rateLimit = await checkLoginRateLimit(email, ip);
  if (!rateLimit.allowed) {
    await writeAuditEvent({
      eventType: 'login_failure',
      entityType: 'auth',
      outcome: 'failure',
      ipAddress: ip,
      userAgent,
      reason: rateLimit.reason,
    });
    // Intentionally still generic to the user, but the retry-after is a
    // legitimate, non-enumerating signal (it doesn't say whether the
    // account exists, only that this email/IP is temporarily throttled).
    redirect(`/login?error=rate_limited&retryAfter=${rateLimit.retryAfterSeconds}`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    await recordLoginAttempt(email, ip, 'failure', error?.message);
    await writeAuditEvent({
      eventType: 'login_failure',
      entityType: 'auth',
      outcome: 'failure',
      ipAddress: ip,
      userAgent,
      reason: 'invalid_credentials',
    });
    redirect(`/login?error=${GENERIC_ERROR}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('status, organisation_id, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profileError) {
    // Fail closed: if we can't confirm the account is active, don't grant
    // a session rather than silently letting a lookup failure through as
    // if there were no problem.
    await supabase.auth.signOut();
    await recordLoginAttempt(email, ip, 'failure', 'profile_lookup_failed');
    await writeAuditEvent({
      eventType: 'login_failure',
      entityType: 'auth',
      actorId: data.user.id,
      outcome: 'failure',
      ipAddress: ip,
      userAgent,
      reason: 'profile_lookup_failed',
    });
    redirect(`/login?error=${GENERIC_ERROR}`);
  }

  if (profile && profile.status !== 'active') {
    await supabase.auth.signOut();
    await recordLoginAttempt(email, ip, 'failure', 'account_not_active');
    await writeAuditEvent({
      eventType: 'login_failure',
      entityType: 'auth',
      actorId: data.user.id,
      outcome: 'failure',
      ipAddress: ip,
      userAgent,
      reason: 'account_not_active',
    });
    redirect('/unauthorized?reason=account_not_active');
  }

  await recordLoginAttempt(email, ip, 'success');
  await writeAuditEvent({
    eventType: 'login_success',
    entityType: 'auth',
    actorId: data.user.id,
    organisationId: profile?.organisation_id ?? null,
    roleAtTime: profile?.role ?? null,
    outcome: 'success',
    ipAddress: ip,
    userAgent,
  });

  // MFA step-up and mandatory-enrollment routing is handled centrally by
  // src/proxy.ts on the very next request - it re-derives the same
  // assurance-level/mfa_required state this function would otherwise have
  // to duplicate, and (unlike a one-time check here) keeps enforcing it on
  // every subsequent request too, not just immediately after login.
  redirect(redirectTo);
}
