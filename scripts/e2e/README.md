# Login-flow end-to-end test

Drives the real login → mandatory MFA enrollment → dashboard → sign-out flow
against a running instance of the app and the real Supabase project, using a
throwaway test account it creates and deletes automatically.

## Why this exists

The sandbox that built this codebase could not run this test itself — its
outbound network policy explicitly denies direct connections to the Supabase
project host (`wszcqjxlkqtjqxyolcos.supabase.co`), which the running app
needs to reach for every auth call. That's a policy restriction on that
sandbox specifically, not anything about this code. Run this from anywhere
that has normal internet access: your own machine, CI, or a different Claude
Code environment/session.

## What it actually exercises

This isn't a check that pages return 200 — it's a full browser session that:

1. Signs in with a real password against Supabase Auth.
2. Confirms mandatory MFA enrollment is enforced (redirected to
   `/mfa/enroll`, not `/dashboard`).
3. Completes real TOTP enrollment — reads the actual secret Supabase issues,
   computes a valid 6-digit code for it (RFC 6238, verified against the
   official test vectors in `totp.test.mjs`), and submits it.
4. Confirms the session actually reaches aal2 and lands on `/dashboard`.
5. Signs out, and confirms the session is genuinely cleared (a follow-up
   request to `/dashboard` redirects back to `/login`, not just a client-side
   navigation).
6. Confirms a wrong password produces the same generic, non-enumerating
   error as any other failure (§3 of the architecture assessment).

This directly re-tests the exact bugs fixed in this codebase's auth review —
particularly the MFA-enrollment-bypass fix, which can only really be
verified by walking the real enrollment flow with a real TOTP code, not by
reading the source.

## Setup

```bash
npm install                        # installs the playwright devDependency
npx playwright install chromium    # one-time browser download (skip in
                                    # Claude Code environments - already
                                    # provisioned there)
```

Make sure `.env.local` has real values (see `.env.example`), in particular
`SUPABASE_SERVICE_ROLE_KEY` — this script uses it to create and delete the
test account via the Supabase admin API. **Never commit this file.**

## Running it

```bash
# Terminal 1
npm run dev              # or: npm run build && npm run start

# Terminal 2
npm run test:e2e:login
```

Optional: set `E2E_BASE_URL` if the app isn't at `http://localhost:3000`
(e.g. a deployed preview URL).

## Output

Each step prints ✓ or ✗ with a description, followed by a pass/fail count
and a process exit code (0 = all passed, 1 = at least one failed or the
script crashed). The test account is deleted in a `finally` block regardless
of outcome, so a failed run shouldn't leave test data behind — but if the
script is killed outright (e.g. Ctrl-C mid-run), check the Supabase
dashboard's Authentication → Users list for a stray
`test-login-flow-*@refertoryan.local` account and delete it manually.

## Files

- `totp.mjs` — standalone RFC 6238 TOTP generator (no dependencies beyond
  Node's built-in `crypto`).
- `totp.test.mjs` — validates it against the official RFC 6238 Appendix B
  test vectors; runs as part of the normal `npm test` suite.
- `supabase-admin.mjs` — creates/deletes the throwaway test account via the
  Supabase admin API (service-role key required).
- `login-flow.mjs` — the runnable script described above.
