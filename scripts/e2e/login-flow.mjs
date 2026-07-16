/**
 * End-to-end test of the real login -> mandatory MFA enrollment ->
 * dashboard -> sign-out flow, against a running instance of the app and a
 * real Supabase project.
 *
 * Requires network access to the Supabase project (this could NOT be run
 * from the sandbox that originally built this codebase - its egress proxy
 * denies direct connections to the Supabase host by policy). Run this from
 * an environment that can actually reach *.supabase.co.
 *
 * Usage:
 *   1. npm install               (installs the `playwright` devDependency)
 *   2. npx playwright install chromium   (one-time browser download)
 *   3. In one terminal:  npm run dev     (or `npm run build && npm run start`)
 *   4. In another:       npm run test:e2e:login
 *
 * See scripts/e2e/README.md for full details and required env vars.
 */
import { chromium } from 'playwright';
import { createTestUser, deleteTestUser } from './supabase-admin.mjs';
import { generateTotp } from './totp.mjs';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) {
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
    passed += 1;
  } else {
    console.log(`  \x1b[31m✗\x1b[0m ${label}`);
    failed += 1;
  }
}

async function main() {
  console.log(`Creating a temporary test account (mfa_required=true)...`);
  const { userId, email, password } = await createTestUser();
  console.log(`  Created ${email} (${userId})`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();

    console.log('\nStep 1: sign in with correct credentials');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/mfa\/enroll/, { timeout: 10_000 }).catch(() => {});
    check('redirected to /mfa/enroll (mandatory enrollment enforced)', page.url().includes('/mfa/enroll'));

    console.log('\nStep 2: complete mandatory MFA enrollment');
    await page.click('button:has-text("Set up authenticator app")');
    const secretLocator = page.getByTestId('mfa-secret');
    await secretLocator.waitFor({ timeout: 10_000 });
    const secret = (await secretLocator.textContent())?.trim();
    check('enrollment QR/secret step rendered', Boolean(secret));

    const code = generateTotp(secret ?? '');
    await page.fill('#enroll-code', code);
    await page.click('button:has-text("Confirm and enable")');
    await page.waitForURL(/\/dashboard/, { timeout: 10_000 }).catch(() => {});
    check('redirected to /dashboard after successful enrollment (aal2 reached)', page.url().includes('/dashboard'));

    console.log('\nStep 3: dashboard renders the signed-in profile');
    check('dashboard shows a welcome heading', (await page.locator('h1', { hasText: 'Welcome' }).count()) > 0);

    console.log('\nStep 4: sign out');
    await page.click('button:has-text("Sign out")');
    await page.waitForURL(/\/login/, { timeout: 10_000 }).catch(() => {});
    check('redirected to /login after sign-out', page.url().includes('/login'));

    console.log('\nStep 5: session is actually cleared (regression check)');
    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForURL(/\/login/, { timeout: 10_000 }).catch(() => {});
    check('visiting /dashboard post-sign-out redirects to /login', page.url().includes('/login'));

    console.log('\nStep 6: wrong password gives a generic, non-enumerating error');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('#email', email);
    await page.fill('#password', 'definitely-the-wrong-password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/error=invalid_credentials/, { timeout: 10_000 }).catch(() => {});
    check('wrong password redirects with the generic invalid_credentials error', page.url().includes('error=invalid_credentials'));
  } finally {
    await browser.close();
    console.log(`\nCleaning up test account ${userId}...`);
    await deleteTestUser(userId);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('\nE2E script crashed:', error);
  process.exit(1);
});
