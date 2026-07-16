import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-3xl font-semibold text-slate-900">ReturnToRyan</h1>
      <p className="text-slate-600">
        Secure referral portal for optometrists referring patients to Eye Clinic London.
      </p>
      <p className="text-sm text-slate-500">
        The full public marketing site (clinical education, referral guides, CPD events) is being
        migrated from the previous preview build in a later stage. Existing referring-practice
        accounts should sign in below.
      </p>
      <Link
        href="/login"
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
      >
        Sign in
      </Link>
    </main>
  );
}
