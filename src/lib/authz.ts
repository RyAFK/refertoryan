import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const ECL_ROLES = [
  'ecl_system_admin',
  'ecl_clinical_user',
  'ecl_referral_coordinator',
  'ecl_read_only_auditor',
] as const;

export type EclRole = (typeof ECL_ROLES)[number];
export type ProfileRole = EclRole | 'referring_user';

export type PracticeRole =
  | 'practice_owner'
  | 'practice_admin'
  | 'optometrist'
  | 'dispensing_optician'
  | 'locum_optometrist'
  | 'team_member'
  | 'read_only';

export interface CurrentProfile {
  id: string;
  role: ProfileRole;
  status: 'pending' | 'active' | 'suspended' | 'rejected' | 'deactivated';
  firstName: string;
  lastName: string;
  organisationId: string | null;
}

/**
 * Reads the caller's own profile row through the RLS-protected server
 * client - this is a read of the *caller's own* data (profiles_select_own_or_admin
 * permits id = auth.uid()), not a privileged lookup. Returns null for an
 * unauthenticated caller or one with no profile row yet.
 */
export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, role, status, first_name, last_name, organisation_id')
    .eq('id', user.id)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    role: data.role,
    status: data.status,
    firstName: data.first_name,
    lastName: data.last_name,
    organisationId: data.organisation_id,
  };
}

/** Redirects to /login if there is no authenticated, active profile. */
export async function requireActiveProfile(): Promise<CurrentProfile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect('/login');
  if (profile.status !== 'active') redirect('/unauthorized?reason=account_not_active');
  return profile;
}

export function isEclStaff(role: ProfileRole): role is EclRole {
  return (ECL_ROLES as readonly string[]).includes(role);
}

export function isSystemAdmin(role: ProfileRole): boolean {
  return role === 'ecl_system_admin';
}

export function isReadOnlyAuditor(role: ProfileRole): boolean {
  return role === 'ecl_read_only_auditor';
}

/**
 * Server-side gate for a whole route/action. This is the single place every
 * protected server action should call before doing anything else - never
 * rely on the calling UI having hidden a button (§20).
 */
export async function requireRole(allowed: readonly ProfileRole[]): Promise<CurrentProfile> {
  const profile = await requireActiveProfile();
  if (!allowed.includes(profile.role)) {
    redirect('/unauthorized?reason=insufficient_role');
  }
  return profile;
}

/**
 * Practice-level access check, delegating to the has_practice_access
 * Postgres function so the authorisation rule lives in exactly one place
 * (the RLS layer) rather than being re-implemented in application code
 * where it could drift out of sync.
 */
export async function hasPracticeAccess(practiceId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('has_practice_access', { target_practice_id: practiceId });
  if (error) return false;
  return Boolean(data);
}

export async function requirePracticeAccess(practiceId: string): Promise<CurrentProfile> {
  const profile = await requireActiveProfile();
  const allowed = await hasPracticeAccess(practiceId);
  if (!allowed) redirect('/unauthorized?reason=no_practice_access');
  return profile;
}
