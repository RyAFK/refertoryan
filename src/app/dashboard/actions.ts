'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent } from '@/lib/audit';
import { getRequestContext } from '@/lib/request-context';

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    const { ipAddress, userAgent } = await getRequestContext();
    await writeAuditEvent({
      eventType: 'logout',
      entityType: 'auth',
      actorId: user.id,
      outcome: 'success',
      ipAddress,
      userAgent,
    });
  }

  redirect('/login');
}
