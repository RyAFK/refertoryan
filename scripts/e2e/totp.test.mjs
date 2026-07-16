import { describe, expect, it } from 'vitest';
import { generateTotp } from './totp.mjs';

// RFC 6238 Appendix B test vectors. Secret is the ASCII string
// "12345678901234567890" (20 bytes, for the SHA1 test cases), base32
// encoded. T=59s falls in counter window 1 (floor(59/30)).
// https://datatracker.ietf.org/doc/html/rfc6238#appendix-B
const RFC_6238_SHA1_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('generateTotp (RFC 6238 conformance)', () => {
  it('matches the official 8-digit test vector at T=59s', () => {
    expect(generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 59_000, digits: 8 })).toBe('94287082');
  });

  it('matches the official 8-digit test vector at T=1111111109s', () => {
    expect(generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 1_111_111_109_000, digits: 8 })).toBe('07081804');
  });

  it('matches the official 8-digit test vector at T=1111111111s', () => {
    expect(generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 1_111_111_111_000, digits: 8 })).toBe('14050471');
  });

  it('produces the correct 6-digit code as the last 6 digits of the 8-digit vector', () => {
    // 6-digit codes are `binCode % 10^6`, which is mathematically the last
    // 6 digits of the same value the 8-digit vector is derived from (since
    // 10^6 divides 10^8) - this is what Supabase Auth's default 6-digit
    // TOTP factors actually expect from an authenticator app.
    expect(generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 59_000, digits: 6 })).toBe('287082');
  });

  it('changes every 30-second step and is stable within one', () => {
    const first = generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 60_000 });
    const stillFirst = generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 89_000 });
    const next = generateTotp(RFC_6238_SHA1_SECRET, { timestamp: 90_000 });
    expect(stillFirst).toBe(first);
    expect(next).not.toBe(first);
  });
});
