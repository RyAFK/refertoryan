import { NextResponse, type NextRequest } from 'next/server';
import { refreshSession } from '@/lib/supabase/middleware';
import { isPublicPath } from '@/lib/public-paths';

function applySecurityHeaders(response: NextResponse): NextResponse {
  // No unsafe-inline / unsafe-eval: Next.js App Router doesn't require
  // either for its own runtime. If a future dependency forces one of them
  // in, that must be a deliberate, documented exception per §21, not a
  // silent widening of this policy.
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // Tailwind + inline style props from the ported UI; see docs/architecture for the tracked exception
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  response.headers.set('X-Frame-Options', 'DENY');
  return response;
}

/**
 * Builds a redirect response that carries forward any refreshed
 * Supabase session cookies attached to `base` (refreshSession() reassigns
 * `response` and re-attaches Set-Cookie headers whenever it refreshes an
 * expiring token). Returning a bare NextResponse.redirect() instead would
 * silently drop those cookies, forcing another refresh - or an unexpected
 * sign-out - on the very next request.
 */
function redirectPreservingCookies(base: NextResponse, url: URL): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  base.cookies.getAll().forEach((cookie) => redirectResponse.cookies.set(cookie));
  return redirectResponse;
}

export async function proxy(request: NextRequest) {
  const { response, user, aal, aalError, mfaRequired } = await refreshSession(request);
  const pathname = request.nextUrl.pathname;

  if (!user) {
    if (isPublicPath(pathname)) return applySecurityHeaders(response);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return applySecurityHeaders(redirectPreservingCookies(response, loginUrl));
  }

  // A verified MFA factor exists (aal.next reaches 'aal2') but this
  // session hasn't completed the challenge yet - or the assurance-level
  // check itself failed, which is treated the same way (fail closed
  // rather than silently granting access on an errored check).
  const hasVerifiedFactor = aal?.next === 'aal2';
  const needsStepUp = aalError || (hasVerifiedFactor && aal?.current !== 'aal2');

  // No verified factor exists yet, but this account's role requires one:
  // mandatory first-time enrollment. Enforced on every request (not just
  // immediately after login) so it can't be bypassed by simply abandoning
  // the post-login redirect before completing enrollment.
  const needsEnrollment = !aalError && !hasVerifiedFactor && mfaRequired;

  if (needsStepUp) {
    if (pathname === '/mfa/verify') return applySecurityHeaders(response);
    const mfaUrl = new URL('/mfa/verify', request.url);
    mfaUrl.searchParams.set('redirectTo', pathname);
    return applySecurityHeaders(redirectPreservingCookies(response, mfaUrl));
  }

  if (needsEnrollment) {
    if (pathname === '/mfa/enroll') return applySecurityHeaders(response);
    const enrollUrl = new URL('/mfa/enroll', request.url);
    return applySecurityHeaders(redirectPreservingCookies(response, enrollUrl));
  }

  // Fully authenticated with nothing outstanding: don't allow a session
  // that already satisfies (or never needed) MFA to sit on /mfa/enroll and
  // silently register an extra factor - that path (self-enrolling a new
  // device from a session that only ever proved knowledge of the
  // password) was the original MFA-bypass this gate exists to close.
  if (pathname === '/mfa/verify' || pathname === '/mfa/enroll') {
    return applySecurityHeaders(redirectPreservingCookies(response, new URL('/dashboard', request.url)));
  }

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all paths except static assets and Next internals.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
