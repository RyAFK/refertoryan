# Deploying this branch to Vercel

This branch replaces the previous static Vite site with a Next.js app
(server-rendered pages, Server Actions, middleware). It cannot be deployed
with the old static-site settings — that's what broke refertoryan.com when
PR #11 merged on 2026-07-15 (Vercel had no server to route requests to, so
every page 404'd). That merge has been reverted on `main`; this checklist is
what's needed before this branch is merged again.

I don't have Vercel dashboard/API access from this session, so these steps
need to be done manually by whoever administers the Vercel project.

## 1. Framework preset

`vercel.json` in this branch now sets `"framework": "nextjs"`, which should
make Vercel build it correctly. But if the project's **Framework Preset**
was explicitly pinned in the dashboard when it was first imported (likely,
since it was originally set up for Vite), that dashboard setting can take
precedence over `vercel.json`. Check and fix if needed:

**Vercel dashboard → this project → Settings → General → Framework Preset**
→ set to **Next.js** (not "Vite" or "Other").

Also check **Settings → General → Build & Development Settings** — if
**Build Command**, **Output Directory**, or **Install Command** have the
"Override" toggle switched on with old Vite-era values (e.g. Output
Directory `dist`), turn the override off so it uses the Next.js framework
defaults, or update them to match `vercel.json`.

## 2. Environment variables

**Vercel dashboard → this project → Settings → Environment Variables** —
add these (see `.env.example` for what each one does):

| Variable | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_MODE` | `demo` for a preview/staging deploy, `production` only once the Stage 1 assessment's launch blockers are cleared | Controls the demo-data banner and the production-readiness boot check |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://wszcqjxlkqtjqxyolcos.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | the publishable/anon key from Supabase project settings → API | Safe to expose to the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | the **service_role** key from Supabase project settings → API | **Secret.** Mark it as a Vercel "Sensitive" env var. Required for login rate-limiting and audit logging — sign-in will fail without it |
| `NEXT_PUBLIC_SITE_URL` | the deployed URL, e.g. `https://refertoryan.com` | Used to build the password-reset redirect link |

If `NEXT_PUBLIC_APP_MODE` is left unset or misspelled, the app fails closed
to `demo` mode (see `src/lib/env.ts`) rather than accidentally running as
production — that's intentional, not a bug, if you see the demo banner
unexpectedly.

## 3. Before merging to `main`

- [ ] Framework Preset confirmed as Next.js in the dashboard
- [ ] Environment variables set for the target environment (Preview and/or Production)
- [ ] A Preview deployment from this branch loads `/` and `/login` without a 404
- [ ] Sign-in has been exercised end-to-end against a real test account (not yet done in this session — see `README.md`)
- [ ] Reviewed against the "production launch blockers" list in `docs/architecture/stage-1-assessment.md` if this is going to production, not just preview
