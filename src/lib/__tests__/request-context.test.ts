import { describe, expect, it } from 'vitest';
import { parseClientIp } from '@/lib/request-context';

describe('parseClientIp', () => {
  it('uses the last hop of a multi-value X-Forwarded-For header', () => {
    // The last entry is appended by the trusted edge proxy; earlier
    // entries are client-supplied and can be forged to rotate the
    // apparent IP on every request, defeating per-IP rate limiting.
    expect(parseClientIp('203.0.113.7, 10.0.0.1, 10.0.0.2', null)).toBe('10.0.0.2');
  });

  it('trims whitespace around hops', () => {
    expect(parseClientIp('203.0.113.7 ,  10.0.0.2 ', null)).toBe('10.0.0.2');
  });

  it('uses the single value when only one hop is present', () => {
    expect(parseClientIp('203.0.113.7', null)).toBe('203.0.113.7');
  });

  it('falls back to X-Real-IP when X-Forwarded-For is absent', () => {
    expect(parseClientIp(null, '203.0.113.7')).toBe('203.0.113.7');
  });

  it('returns null when neither header is present', () => {
    expect(parseClientIp(null, null)).toBeNull();
  });

  it('falls back to X-Real-IP when X-Forwarded-For is empty/whitespace-only', () => {
    expect(parseClientIp('  ', '203.0.113.7')).toBe('203.0.113.7');
  });
});
