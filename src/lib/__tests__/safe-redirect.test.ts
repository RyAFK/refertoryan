import { describe, expect, it } from 'vitest';
import { sanitizeRedirectTarget } from '@/lib/safe-redirect';

describe('sanitizeRedirectTarget', () => {
  it('allows a plain relative path', () => {
    expect(sanitizeRedirectTarget('/dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectTarget('/referrals/123')).toBe('/referrals/123');
  });

  it('falls back on an absolute URL to another origin', () => {
    expect(sanitizeRedirectTarget('https://evil.example/phish')).toBe('/dashboard');
    expect(sanitizeRedirectTarget('http://evil.example')).toBe('/dashboard');
  });

  it('falls back on a protocol-relative URL', () => {
    expect(sanitizeRedirectTarget('//evil.example')).toBe('/dashboard');
  });

  it('falls back on a value containing a scheme anywhere', () => {
    expect(sanitizeRedirectTarget('/ok/javascript://evil')).toBe('/dashboard');
  });

  it('falls back on empty, null, or undefined input', () => {
    expect(sanitizeRedirectTarget('')).toBe('/dashboard');
    expect(sanitizeRedirectTarget(null)).toBe('/dashboard');
    expect(sanitizeRedirectTarget(undefined)).toBe('/dashboard');
  });

  it('falls back on a value that does not start with /', () => {
    expect(sanitizeRedirectTarget('dashboard')).toBe('/dashboard');
    expect(sanitizeRedirectTarget('evil.example')).toBe('/dashboard');
  });

  it('honours a custom fallback', () => {
    expect(sanitizeRedirectTarget('https://evil.example', '/mfa/verify')).toBe('/mfa/verify');
  });
});
