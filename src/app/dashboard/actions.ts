'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { writeAuditEvent } from '@/lib/audit';

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await supabase.auth.signOut();

  if (user) {
    const headerList = await headers();
    await writeAuditEvent({
      eventType: 'logout',
      entityType: 'auth',
      actorId: user.id,
      outcome: 'success',
      ipAddress: headerList.get('x-forwarded-for'),
      userAgent: headerList.get('user-agent'),
    });
  }

  redirect('/login');
}
