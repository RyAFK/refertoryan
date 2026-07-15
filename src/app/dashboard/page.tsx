import { requireActiveProfile } from '@/lib/authz';
import { signOutAction } from './actions';

const ROLE_LABELS: Record<string, string> = {
  ecl_system_admin: 'ECL System Administrator',
  ecl_clinical_user: 'ECL Clinical User',
  ecl_referral_coordinator: 'ECL Referral Coordinator',
  ecl_read_only_auditor: 'ECL Read-Only Auditor',
  referring_user: 'Referring practice user',
};

export default async function DashboardPage() {
  const profile = await requireActiveProfile();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Welcome, {profile.firstName} {profile.lastName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{ROLE_LABELS[profile.role] ?? profile.role}</p>
        </div>
        <form action={signOutAction}>
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6">
        <p className="text-sm text-slate-600">
          This is the Stage 2 authenticated shell — it confirms sign-in, MFA step-up, session
          handling and server-side role resolution are working end-to-end. The referral workflow,
          patient records, clinical notes, messaging and file uploads described in the
          architecture assessment (<code>docs/architecture/stage-1-assessment.md</code>) are Stage
          3 work and are not built yet.
        </p>
      </div>
    </main>
  );
}
