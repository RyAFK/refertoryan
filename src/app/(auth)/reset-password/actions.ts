'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent } from '@/lib/audit';

export async function requestPasswordResetAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim();

  if (email) {
    const supabase = await createClient();
    // Supabase intentionally returns success here regardless of whether the
    // email is registered, so this call never reveals account existence.
    // Errors (rate limiting, malformed email) are swallowed for the same
    // reason - the response to the user must not vary by outcome.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/reset-password/confirm`,
    });
    await writeAuditEvent({
      eventType: 'password_reset_requested',
      entityType: 'auth',
      outcome: error ? 'failure' : 'success',
      reason: error?.message,
    });
  }

  redirect('/reset-password?requested=1');
}
