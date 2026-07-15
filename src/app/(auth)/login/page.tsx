import Link from 'next/link';
import { loginAction } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'That email and password combination is not recognised.',
  rate_limited: 'Too many sign-in attempts. Please wait before trying again.',
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; retryAfter?: string; redirectTo?: string };
}) {
  const errorMessage = searchParams.error ? ERROR_MESSAGES[searchParams.error] ?? ERROR_MESSAGES.invalid_credentials : null;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          ReturnToRyan is for approved referring-practice and Eye Clinic London accounts only.
          New accounts are created by an administrator, not by self-registration.
        </p>
      </div>

      {errorMessage && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {errorMessage}
          {searchParams.retryAfter ? ` Try again in about ${Math.ceil(Number(searchParams.retryAfter) / 60)} minute(s).` : ''}
        </p>
      )}

      <form action={loginAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo ?? '/dashboard'} />
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Sign in
        </button>
      </form>

      <Link href="/reset-password" className="text-sm text-slate-600 underline">
        Forgotten your password?
      </Link>
    </main>
  );
}
