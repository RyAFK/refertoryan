'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { beginMfaEnrollmentAction, completeMfaEnrollmentAction, type BeginEnrollmentResult } from './actions';

export function EnrollClient() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<BeginEnrollmentResult | null>(null);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleBegin() {
    setError(null);
    startTransition(async () => {
      const result = await beginMfaEnrollmentAction();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setEnrollment(result.data);
    });
  }

  function handleVerify(event: React.FormEvent) {
    event.preventDefault();
    if (!enrollment) return;
    setError(null);
    startTransition(async () => {
      const result = await completeMfaEnrollmentAction(enrollment.factorId, code);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push('/dashboard');
    });
  }

  if (!enrollment) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-slate-600">
          Your account requires multi-factor authentication. You&apos;ll need an authenticator app
          (such as Google Authenticator, 1Password, or Authy) on your phone.
        </p>
        {error && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleBegin}
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {pending ? 'Preparing…' : 'Set up authenticator app'}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-4">
      <p className="text-sm text-slate-600">
        Scan this QR code with your authenticator app, or enter the setup key manually.
      </p>
      <div
        className="mx-auto h-48 w-48 [&_svg]:h-full [&_svg]:w-full"
        // QR SVG returned directly by Supabase's own MFA enrollment API, not user input.
        dangerouslySetInnerHTML={{ __html: enrollment.qrCodeSvg }}
        role="img"
        aria-label="MFA setup QR code"
      />
      <p className="break-all rounded-lg bg-slate-100 px-3 py-2 text-center font-mono text-xs text-slate-700">
        {enrollment.secret}
      </p>
      {error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="enroll-code" className="mb-1 block text-sm font-medium text-slate-700">
          Enter the 6-digit code from your app
        </label>
        <input
          id="enroll-code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm tracking-widest"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {pending ? 'Verifying…' : 'Confirm and enable'}
      </button>
    </form>
  );
}
