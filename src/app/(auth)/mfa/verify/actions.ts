'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent } from '@/lib/audit';
import { getRequestContext } from '@/lib/request-context';
import { sanitizeRedirectTarget } from '@/lib/safe-redirect';

export async function verifyMfaAction(formData: FormData): Promise<void> {
  const factorId = String(formData.get('factorId') ?? '');
  const code = String(formData.get('code') ?? '').trim();
  const redirectTo = sanitizeRedirectTarget(String(formData.get('redirectTo') ?? ''));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { ipAddress, userAgent } = await getRequestContext();

  if (!factorId || !code || !user) {
    redirect('/mfa/verify?error=invalid_code');
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError || !challenge) {
    redirect('/mfa/verify?error=invalid_code');
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
      ipAddress,
      userAgent,
    });
    redirect('/mfa/verify?error=invalid_code');
  }

  await writeAuditEvent({
    eventType: 'mfa_challenge_success',
    entityType: 'auth',
    actorId: user.id,
    outcome: 'success',
    ipAddress,
    userAgent,
  });

  redirect(redirectTo);
}
