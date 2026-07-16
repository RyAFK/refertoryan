import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { EnrollClient } from './EnrollClient';

export default async function MfaEnrollPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <h1 className="text-2xl font-semibold text-slate-900">Set up multi-factor authentication</h1>
      <EnrollClient />
    </main>
  );
}
