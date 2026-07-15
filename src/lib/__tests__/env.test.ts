import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const ORIGINAL_ENV = { ...process.env };

async function loadEnvModule() {
  vi.resetModules();
  return import('@/lib/env');
}

describe('env / production readiness', () => {
  beforeEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('fails closed to demo mode for an unrecognised APP_MODE', async () => {
    process.env.NEXT_PUBLIC_APP_MODE = 'not-a-real-mode';
    const { APP_MODE, isProductionMode } = await loadEnvModule();
    expect(APP_MODE).toBe('demo');
    expect(isProductionMode).toBe(false);
  });

  it('does nothing outside production mode even with no config at all', async () => {
    process.env.NEXT_PUBLIC_APP_MODE = 'demo';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { assertProductionReadiness } = await loadEnvModule();
    expect(() => assertProductionReadiness()).not.toThrow();
  });

  it('throws in production mode when secrets are missing', async () => {
    process.env.NEXT_PUBLIC_APP_MODE = 'production';
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const { assertProductionReadiness, ProductionReadinessError } = await loadEnvModule();
    expect(() => assertProductionReadiness()).toThrow(ProductionReadinessError);
  });

  it('throws in production mode when the Supabase URL points at localhost', async () => {
    process.env.NEXT_PUBLIC_APP_MODE = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'a-real-looking-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'a-real-looking-key';
    const { assertProductionReadiness } = await loadEnvModule();
    expect(() => assertProductionReadiness()).toThrow(/localhost/);
  });

  it('does not throw in production mode when everything looks configured', async () => {
    process.env.NEXT_PUBLIC_APP_MODE = 'production';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://real-project-ref.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'a-real-looking-key';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'a-real-looking-key';
    const { assertProductionReadiness } = await loadEnvModule();
    expect(() => assertProductionReadiness()).not.toThrow();
  });
});
