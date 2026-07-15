# ReturnToRyan — Eye Clinic London Referral Portal

Secure referral platform for optometrists referring patients to Eye Clinic London.
See `docs/architecture/stage-1-assessment.md` for the full architecture assessment,
data-flow diagram, role/permission matrix, and staged implementation plan this
build follows.

**This is not yet suitable for real patient data.** See the "production
launch blockers" section of the Stage 1 assessment for what's outstanding.

## Stack

- Next.js (App Router) + TypeScript
- Supabase (PostgreSQL + Auth with MFA + Storage) — schema in `supabase/migrations/`
- Tailwind CSS
- Vitest for unit tests

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in your Supabase project details
npm run dev
```

Then open http://localhost:3000. See `.env.example` for what each variable
does and why `SUPABASE_SERVICE_ROLE_KEY` is required even for local sign-in
(it backs login rate-limiting and audit logging).

## Scripts

```bash
npm run dev         # start the dev server
npm run build        # production build
npm run start        # run a production build
npm run lint          # ESLint
npm run typecheck     # tsc --noEmit
npm run test           # vitest run
```

## What's implemented so far (Stage 2)

- Organisation/role-based database schema with Row Level Security
  (`supabase/migrations/`, see `supabase/README.md`).
- Email/password sign-in with mandatory MFA step-up (TOTP), enrollment flow,
  durable rate-limiting/lockout on login attempts, non-enumerating error
  messages and password reset.
- Server-side session refresh + AAL2 (MFA) enforcement in `src/proxy.ts`
  (Next's routing-layer request hook — the successor to `middleware.ts`),
  plus security headers (CSP, HSTS, X-Frame-Options, etc.) on every response.
- Append-only audit logging (`src/lib/audit.ts`) and a server-side
  authorisation helper (`src/lib/authz.ts`) that every protected route/action
  uses — no permission check is ever client-side-only.
- A demo-mode banner driven by `NEXT_PUBLIC_APP_MODE`, and a startup check
  (`src/instrumentation.ts`) that refuses to boot in production mode with
  missing/placeholder secrets.

## What's not built yet

The referral workflow, patient records, clinical notes, secure messaging,
file uploads, and the full marketing/dashboard UI (previously prototyped in
`src/App.jsx` under Vite) are Stage 3 work and are not wired up yet. The
`/` and `/dashboard` routes are a minimal authenticated shell proving the
auth chain works end-to-end, not the finished product.

`src/App.jsx` and its supporting files (`src/clinical-education/`,
`src/referral-assistant/`, `src/theme.js`) are the pre-migration reference
implementation — a Vite-only React SPA prototype with no backend. They are
not part of the Next.js build and are kept for reference during the Stage 3
UI port. `vite.config.js` remains for that purpose but the `vite` package
itself is no longer a tracked dependency; run `npx vite` if you need to
preview it ad hoc.

## Sign-in

There is no public self-registration. Accounts are created by an ECL
administrator. See the role matrix in `docs/architecture/stage-1-assessment.md`
for what each role can access.
