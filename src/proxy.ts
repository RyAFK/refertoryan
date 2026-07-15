import { NextResponse, type NextRequest } from 'next/server';
import { refreshSession } from '@/lib/supabase/middleware';

const PUBLIC_PATHS = ['/login', '/mfa', '/unauthorized', '/privacy', '/'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => (path === '/' ? pathname === '/' : pathname.startsWith(path)));
}

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

export async function proxy(request: NextRequest) {
  const { response, user, aal } = await refreshSession(request);
  const pathname = request.nextUrl.pathname;

  if (!user && !isPublicPath(pathname)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Step-up (AAL2) enforcement: a user with an enrolled MFA factor who has
  // only completed password auth (aal1) must complete MFA before reaching
  // anything except the MFA verification flow itself. This is what makes
  // MFA actually mandatory rather than merely available.
  if (user && aal?.next === 'aal2' && aal.current !== 'aal2' && !pathname.startsWith('/mfa')) {
    const mfaUrl = new URL('/mfa/verify', request.url);
    mfaUrl.searchParams.set('redirectTo', pathname);
    return applySecurityHeaders(NextResponse.redirect(mfaUrl));
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
