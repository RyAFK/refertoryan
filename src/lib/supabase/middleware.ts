import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Fail closed: with no Supabase configuration there is no way to
    // establish who the caller is, so nothing gated by auth can proceed.
    return { response, user: null, aal: null as AuthenticatorAssuranceLevel | null };
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
  if (user) {
    const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (data) {
      aal = {
        current: data.currentLevel === 'aal2' ? 'aal2' : data.currentLevel === 'aal1' ? 'aal1' : null,
        next: data.nextLevel === 'aal2' ? 'aal2' : data.nextLevel === 'aal1' ? 'aal1' : null,
      };
    }
  }

  return { response, user, aal };
}

export type AuthenticatorAssuranceLevel = {
  current: 'aal1' | 'aal2' | null;
  next: 'aal1' | 'aal2' | null;
};
