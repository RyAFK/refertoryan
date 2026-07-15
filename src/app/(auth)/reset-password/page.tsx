import { requestPasswordResetAction } from './actions';

export default function ResetPasswordPage({ searchParams }: { searchParams: { requested?: string } }) {
  if (searchParams.requested) {
    return (
      <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Check your email</h1>
        <p className="text-sm text-slate-600">
          If an account exists for that address, we&apos;ve sent instructions to reset the password.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center gap-6 px-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reset your password</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your email address and we&apos;ll send reset instructions if an account exists.
        </p>
      </div>
      <form action={requestPasswordResetAction} className="flex flex-col gap-4">
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
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Send reset instructions
        </button>
      </form>
    </main>
  );
}
