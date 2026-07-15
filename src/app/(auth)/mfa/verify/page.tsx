import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { verifyMfaAction } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'That code was not accepted. Please try again.',
};

export default async function MfaVerifyPage({
  searchParams,
}: {
  searchParams: { error?: string; redirectTo?: string };
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === 'verified');

  if (!factor) {
    // No verified factor yet - this account should be enrolling, not
    // stepping up an existing one.
    redirect('/mfa/enroll');
  }

  const errorMessage = searchParams.error ? ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.invalid_code : null;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Enter your authentication code</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter the 6-digit code from your authenticator app to finish signing in.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
        </p>
      )}

      <form action={verifyMfaAction} className="flex flex-col gap-4">
        <input type="hidden" name="factorId" value={factor.id} />
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/dashboard'} />
        <div>
          <label htmlFor="code" className="mb-1 block text-sm font-medium text-slate-700">
            Authentication code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="one-time-code"
            required
            maxLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Verify
        </button>
      </form>
    </main>
  );
}
