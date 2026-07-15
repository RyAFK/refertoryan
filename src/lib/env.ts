/**
 * Central environment/secret validation. Nothing in this file reads process.env
 * lazily inside request handlers — every value is resolved once here so a
 * missing/placeholder secret fails at startup, not mid-request against real
 * patient data.
 */

export type AppMode = 'demo' | 'staging' | 'production';

const PLACEHOLDER_PATTERNS = [/changeme/i, /example\.com/i, /your[-_]?key/i, /^$/];

function looksLikePlaceholder(value: string | undefined): boolean {
  if (!value) return true;
  return PLACEHOLDER_PATTERNS.some((pattern) => pattern.test(value));
}

function readAppMode(): AppMode {
  const raw = process.env.NEXT_PUBLIC_APP_MODE;
  if (raw === 'demo' || raw === 'staging' || raw === 'production') return raw;
  // Fail closed: an unrecognised or missing mode is treated as demo, never
  // as production, so a misconfigured deploy can't accidentally relax
  // production safeguards.
  return 'demo';
}

export const APP_MODE: AppMode = readAppMode();
export const isDemoMode = APP_MODE === 'demo';
export const isProductionMode = APP_MODE === 'production';

export const env = {
  appMode: APP_MODE,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

export class ProductionReadinessError extends Error {
  constructor(problems: string[]) {
    super(
      `Refusing to start in production mode: ${problems.length} configuration problem(s):\n` +
        problems.map((p) => `  - ${p}`).join('\n')
    );
    this.name = 'ProductionReadinessError';
  }
}

/**
 * Called once at server startup (see instrumentation.ts). Throws — rather
 * than logging and continuing — so a production deploy with missing secrets
 * never serves traffic at all. This is the technical half of §2's "reject
 * startup where required security variables are missing"; it cannot verify
 * the organisational half (that the target database really is the approved
 * production database and not a shared/demo project).
 */
export function assertProductionReadiness(): void {
  if (!isProductionMode) return;

  const problems: string[] = [];

  if (looksLikePlaceholder(env.supabaseUrl)) {
    problems.push('NEXT_PUBLIC_SUPABASE_URL is missing or looks like a placeholder value.');
  }
  if (looksLikePlaceholder(env.supabaseAnonKey)) {
    problems.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing or looks like a placeholder value.');
  }
  if (looksLikePlaceholder(env.supabaseServiceRoleKey)) {
    problems.push('SUPABASE_SERVICE_ROLE_KEY is missing or looks like a placeholder value.');
  }
  if (env.supabaseUrl?.includes('localhost')) {
    problems.push('NEXT_PUBLIC_SUPABASE_URL points at localhost, which cannot be a production database.');
  }

  if (problems.length > 0) {
    throw new ProductionReadinessError(problems);
  }
}
