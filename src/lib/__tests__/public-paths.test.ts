import { describe, expect, it } from 'vitest';
import { isPublicPath, PUBLIC_PATHS } from '@/lib/public-paths';

describe('isPublicPath', () => {
  it('matches an exact public path', () => {
    expect(isPublicPath('/login')).toBe(true);
    expect(isPublicPath('/reset-password')).toBe(true);
  });

  it('matches a sub-path of a public path', () => {
    expect(isPublicPath('/reset-password/confirm')).toBe(true);
  });

  it('matches the root path only exactly', () => {
    expect(isPublicPath('/')).toBe(true);
    expect(isPublicPath('/dashboard')).toBe(false);
  });

  it('does not treat a route that merely shares a string prefix as public', () => {
    // This is the exact bug being regression-tested: a naive
    // pathname.startsWith('/login') would wrongly match these.
    expect(isPublicPath('/login-history')).toBe(false);
    expect(isPublicPath('/mfa-admin')).toBe(false);
    expect(isPublicPath('/unauthorized-users')).toBe(false);
  });

  it('does not treat /mfa/verify or /mfa/enroll as public', () => {
    expect(isPublicPath('/mfa/verify')).toBe(false);
    expect(isPublicPath('/mfa/enroll')).toBe(false);
  });

  it('treats every protected-by-default route as protected', () => {
    expect(isPublicPath('/dashboard')).toBe(false);
    expect(isPublicPath('/some-future-route')).toBe(false);
  });

  it('exposes the expected default allowlist', () => {
    expect(PUBLIC_PATHS).toContain('/reset-password');
    expect(PUBLIC_PATHS).not.toContain('/mfa');
  });
});
