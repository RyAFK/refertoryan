import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (e.g. `node --env-file=.env.local ...`).'
    );
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Creates a throwaway account for exercising the real login/MFA flow.
 * status is set to 'active' immediately (bypassing the normal admin-approval
 * step, which is out of scope for this script) and mfa_required is true so
 * the test walks the full mandatory-enrollment path - the one every bug
 * fixed in this codebase's auth review touched.
 */
export async function createTestUser() {
  const supabase = getAdminClient();
  const email = `test-login-flow-${Date.now()}@refertoryan.local`;
  const password = `Test-${crypto.randomUUID()}-9!`;

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { first_name: 'Test', last_name: 'Account' },
  });

  if (error || !data.user) {
    throw new Error(`createUser failed: ${error?.message ?? 'no user returned'}`);
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ status: 'active', mfa_required: true })
    .eq('id', data.user.id);

  if (profileError) {
    // Best-effort cleanup before surfacing the error.
    await supabase.auth.admin.deleteUser(data.user.id).catch(() => {});
    throw new Error(`profile activation failed: ${profileError.message}`);
  }

  return { userId: data.user.id, email, password };
}

export async function deleteTestUser(userId) {
  if (!userId) return;
  const supabase = getAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) {
    console.error(`[cleanup] failed to delete test user ${userId}: ${error.message}`);
  }
}
