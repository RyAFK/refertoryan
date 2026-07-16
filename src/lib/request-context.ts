import { headers } from 'next/headers';

/**
 * The single place client IP is derived from request headers - every audit
 * write and every rate-limit check must go through this, not re-parse
 * headers ad hoc, so the "which hop do we trust" decision only has to be
 * made (and fixed, if it's ever wrong) in one place.
 */
export function parseClientIp(forwardedFor: string | null, realIp: string | null): string | null {
  if (forwardedFor) {
    const hops = forwardedFor.split(',').map((hop) => hop.trim()).filter(Boolean);
    if (hops.length > 0) {
      // The LAST entry in X-Forwarded-For is appended by the outermost
      // trusted proxy (the platform's edge network) and can't be forged by
      // the client; every earlier entry, including the first, is
      // client-supplied and trivially spoofed. Trusting the first entry
      // let an attacker rotate their apparent IP on every request and
      // bypass the per-IP rate limit entirely.
      return hops[hops.length - 1] ?? null;
    }
  }
  return realIp || null;
}

export async function getRequestContext(): Promise<{ ipAddress: string | null; userAgent: string | null }> {
  const headerList = await headers();
  return {
    ipAddress: parseClientIp(headerList.get('x-forwarded-for'), headerList.get('x-real-ip')),
    userAgent: headerList.get('user-agent'),
  };
}
