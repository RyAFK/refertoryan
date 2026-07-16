'use server';

import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent } from '@/lib/audit';
import { getRequestContext } from '@/lib/request-context';

export interface BeginEnrollmentResult {
  factorId: string;
  qrCodeSvg: string;
  secret: string;
}

export async function beginMfaEnrollmentAction(): Promise<{ ok: true; data: BeginEnrollmentResult } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  // Defense in depth: src/proxy.ts already keeps a session that has a
  // verified factor away from this page, but that's a routing decision,
  // not an authorisation check - this endpoint must independently refuse
  // to let an aal1-only session (someone who has only proven knowledge of
  // the password) register a brand-new factor of its own choosing, which
  // would otherwise let an attacker self-enroll a device and reach aal2
  // without ever possessing the account's real second factor.
  const { data: existingFactors } = await supabase.auth.mfa.listFactors();
  const alreadyEnrolled = existingFactors?.totp?.some((f) => f.status === 'verified');
  if (alreadyEnrolled) {
    return { ok: false, error: 'already_enrolled' };
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
  if (error || !data) {
    return { ok: false, error: error?.message ?? 'enrollment_failed' };
  }

  return {
    ok: true,
    data: {
      factorId: data.id,
      qrCodeSvg: data.totp.qr_code,
      secret: data.totp.secret,
    },
  };
}

export async function completeMfaEnrollmentAction(
  factorId: string,
  code: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const { ipAddress, userAgent } = await getRequestContext();

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError || !challenge) {
    return { ok: false, error: challengeError?.message ?? 'challenge_failed' };
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  if (verifyError) {
    await writeAuditEvent({
      eventType: 'mfa_challenge_failure',
      entityType: 'auth',
      actorId: user.id,
      outcome: 'failure',
      reason: 'enrollment_verification_failed',
      ipAddress,
      userAgent,
    });
    return { ok: false, error: verifyError.message };
  }

  await writeAuditEvent({
    eventType: 'mfa_enrolled',
    entityType: 'auth',
    actorId: user.id,
    outcome: 'success',
    ipAddress,
    userAgent,
  });

  return { ok: true };
}
