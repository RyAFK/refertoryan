const DEFAULT_REDIRECT = '/dashboard';

/**
 * Only ever returns a same-origin relative path. Every server action that
 * accepts a `redirectTo` value (ultimately sourced from a URL query
 * parameter an attacker fully controls) MUST pass it through this before
 * handing it to next/navigation's redirect() - otherwise a crafted login
 * link like /login?redirectTo=https://evil.example can send a freshly
 * authenticated user straight to an attacker-controlled site (open
 * redirect / post-login phishing).
 */
export function sanitizeRedirectTarget(input: string | null | undefined, fallback: string = DEFAULT_REDIRECT): string {
  if (!input) return fallback;
  if (!input.startsWith('/')) return fallback;
  if (input.startsWith('//')) return fallback; // protocol-relative URL
  if (input.includes('://')) return fallback; // belt and suspenders
  return input;
}
