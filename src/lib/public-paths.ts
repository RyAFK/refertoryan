/**
 * Routes reachable without an authenticated session. Deliberately a small,
 * explicit allowlist rather than a denylist: a forgotten route defaults to
 * PROTECTED, which is the safe failure direction for a healthcare app.
 * '/mfa/verify' and '/mfa/enroll' are NOT here - they require a session
 * (an authenticated-but-not-yet-stepped-up user), so they're gated by the
 * `!user` check same as every other protected route; src/proxy.ts's
 * separate step-up logic decides which of the two an authenticated user
 * may reach.
 */
export const PUBLIC_PATHS = ['/login', '/reset-password', '/unauthorized', '/privacy', '/'];

/**
 * Exact-path or path-segment match only (never a bare string-prefix match)
 * so a future route like '/login-history' or '/mfa-admin' can't be
 * accidentally swept into the public allowlist just because it starts with
 * the same characters as an existing public path.
 */
export function isPublicPath(pathname: string, publicPaths: readonly string[] = PUBLIC_PATHS): boolean {
  return publicPaths.some((path) =>
    path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(`${path}/`)
  );
}
