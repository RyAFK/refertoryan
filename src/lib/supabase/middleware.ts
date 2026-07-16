import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Fail closed: with no Supabase configuration there is no way to
    // establish who the caller is, so nothing gated by auth can proceed.
    return {
      response,
      user: null,
      aal: null as AuthenticatorAssuranceLevel | null,
      aalError: false,
      mfaRequired: false,
    };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let aal: AuthenticatorAssuranceLevel | null = null;
  let aalError = false;
  let mfaRequired = false;

  if (user) {
    const [aalResult, profileResult] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.from('profiles').select('mfa_required').eq('id', user.id).maybeSingle(),
    ]);

    if (aalResult.error || !aalResult.data) {
      // Fail closed: an errored assurance-level check must not be treated
      // as "no MFA needed" - src/proxy.ts routes this the same as an
      // explicit step-up requirement.
      aalError = true;
    } else {
      aal = {
        current: aalResult.data.currentLevel === 'aal2' ? 'aal2' : aalResult.data.currentLevel === 'aal1' ? 'aal1' : null,
        next: aalResult.data.nextLevel === 'aal2' ? 'aal2' : aalResult.data.nextLevel === 'aal1' ? 'aal1' : null,
      };
    }

    if (profileResult.error) {
      // Fail closed: if we can't confirm MFA isn't required for this
      // account, assume it is rather than silently skipping mandatory
      // enrollment.
      mfaRequired = true;
    } else {
      mfaRequired = Boolean(profileResult.data?.mfa_required);
    }
  }

  return { response, user, aal, aalError, mfaRequired };
}

export type AuthenticatorAssuranceLevel = {
  current: 'aal1' | 'aal2' | null;
  next: 'aal1' | 'aal2' | null;
};
