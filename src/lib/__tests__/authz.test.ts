import { describe, expect, it } from 'vitest';
import { isEclStaff, isSystemAdmin, isReadOnlyAuditor, ECL_ROLES } from '@/lib/authz';

describe('role classification helpers', () => {
  it('treats every ECL_ROLES entry as ECL staff', () => {
    for (const role of ECL_ROLES) {
      expect(isEclStaff(role)).toBe(true);
    }
  });

  it('does not treat a referring-practice user as ECL staff', () => {
    expect(isEclStaff('referring_user')).toBe(false);
  });

  it('only ecl_system_admin is a system admin', () => {
    expect(isSystemAdmin('ecl_system_admin')).toBe(true);
    expect(isSystemAdmin('ecl_clinical_user')).toBe(false);
    expect(isSystemAdmin('referring_user')).toBe(false);
  });

  it('only ecl_read_only_auditor is a read-only auditor', () => {
    expect(isReadOnlyAuditor('ecl_read_only_auditor')).toBe(true);
    expect(isReadOnlyAuditor('ecl_system_admin')).toBe(false);
  });
});
