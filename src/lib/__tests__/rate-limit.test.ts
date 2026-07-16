import { describe, expect, it } from 'vitest';
import { computeRetryAfterSeconds, RATE_LIMIT_CONFIG } from '@/lib/rate-limit';

describe('computeRetryAfterSeconds', () => {
  it('returns the remaining window time when the oldest failure is recent', () => {
    const now = Date.parse('2026-01-01T00:10:00.000Z');
    const oldestFailure = '2026-01-01T00:00:00.000Z';
    const result = computeRetryAfterSeconds(oldestFailure, 15, now);
    // 15 minute window, 10 minutes elapsed => 5 minutes (300s) remaining.
    expect(result).toBe(300);
  });

  it('never returns a negative value once the window has fully elapsed', () => {
    const now = Date.parse('2026-01-01T01:00:00.000Z');
    const oldestFailure = '2026-01-01T00:00:00.000Z';
    const result = computeRetryAfterSeconds(oldestFailure, 15, now);
    expect(result).toBe(0);
  });

  it('exposes sane default thresholds', () => {
    expect(RATE_LIMIT_CONFIG.EMAIL_MAX_FAILURES).toBeGreaterThan(0);
    expect(RATE_LIMIT_CONFIG.IP_MAX_FAILURES).toBeGreaterThan(RATE_LIMIT_CONFIG.EMAIL_MAX_FAILURES);
  });
});
