const REASON_MESSAGES: Record<string, string> = {
  account_not_active: 'Your account is not yet active. Contact your administrator for access.',
  insufficient_role: 'Your role does not have access to that page.',
  no_practice_access: 'You do not have access to that practice’s records.',
};

export default function UnauthorizedPage({ searchParams }: { searchParams: { reason?: string } }) {
  const message = searchParams.reason
    ? REASON_MESSAGES[searchParams.reason] ?? 'You do not have access to this page.'
    : 'You do not have access to this page.';

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">Access denied</h1>
      <p className="text-sm text-slate-600">{message}</p>
    </main>
  );
}
