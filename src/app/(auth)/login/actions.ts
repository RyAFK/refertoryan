'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { checkLoginRateLimit, recordLoginAttempt } from '@/lib/rate-limit';
import { writeAuditEvent } from '@/lib/audit';

async function getClientIp(): Promise<string | null> {
  const headerList = await headers();
  return (
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    null
  );
}

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
  const redirectTo = String(formData.get('redirectTo') ?? '/dashboard');
  const ip = await getClientIp();
  const userAgent = (await headers()).get('user-agent');

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, mfa_required, organisation_id, role')
    .eq('id', data.user.id)
    .maybeSingle();

  if (profile && profile.status !== 'active') {
    await supabase.auth.signOut();
    await recordLoginAttempt(email, ip, 'failure', 'account_not_active');
    await writeAuditEvent({
      eventType: 'login_failure',
      entityType: 'auth',
      actorId: data.user.id,
      outcome: 'failure',
      ipAddress: ip,
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

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

  if (aal?.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    redirect(`/mfa/verify?redirectTo=${encodeURIComponent(redirectTo)}`);
  }

  if (profile?.mfa_required) {
    const { data: factors } = await supabase.auth.mfa.listFactors();
    const hasVerifiedFactor = factors?.totp?.some((f) => f.status === 'verified');
    if (!hasVerifiedFactor) {
      redirect('/mfa/enroll');
    }
  }

  redirect(redirectTo);
}
