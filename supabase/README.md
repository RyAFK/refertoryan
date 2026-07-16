# Database schema

This directory version-controls the schema for the ReturnToRyan Supabase project
(`wszcqjxlkqtjqxyolcos`, eu-north-1). The migrations in `migrations/` are an
exact copy of what has been applied to that remote project — this directory
did not exist until 2026-07-15, so `migrations/` was backfilled from the
project's live migration history rather than being the origin of it.

**Do not treat this as a demo/toy schema.** Row Level Security is enabled and
enforced (`force row level security`) on every table containing patient,
referral, or clinical data. See `docs/architecture/stage-1-assessment.md` for
how this fits into the wider production architecture, and for what is
explicitly *not* yet built (organisation-scoped multi-project environments,
the Next.js application layer, MFA enforcement in the auth flow, etc).

## Applying migrations to a different environment

This project currently has **one** Supabase project shared across
development/staging use (see the Stage 1 assessment, §12 — separate
prod/dev/staging projects were deferred as a cost decision). If/when a
separate production project is provisioned, apply these migrations to it
in order using the Supabase CLI:

```bash
supabase link --project-ref <new-project-ref>
supabase db push
```

## Schema summary

- `organisations` / `practices` / `practice_memberships` — organisation and
  practice-based access model (§4 of the architecture spec).
- `profiles` — one row per `auth.users` row; holds the ECL-side role
  (`ecl_system_admin` / `ecl_clinical_user` / `ecl_referral_coordinator` /
  `ecl_read_only_auditor` / `referring_user`). Referring-practice users get
  their real role from `practice_memberships.practice_role`
  (`practice_owner`/`practice_admin` → Referring Practice Administrator;
  `optometrist`/`locum_optometrist`/`dispensing_optician` → Referring
  Optometrist; `read_only`/`team_member` → Referring Practice Read-Only
  User). A trigger (`trg_prevent_self_privilege_escalation`) blocks any
  non-admin from changing their own `role`/`status`/`mfa_required`.
- `patients` / `referrals` / `referral_status_history` / `referral_events` /
  `referral_notes` / `referral_documents` — the clinical referral record.
  **Not yet implemented**: append-only/versioned clinical notes with
  addenda (§7), attachment malware-scan/quarantine tracking (§11), urgency
  levels and escalation (§10) — these are Stage 3 work.
- `mfa_configurations` / `user_sessions` — factor-enrollment and
  session-listing/revocation support for §3/§4. The actual TOTP secret /
  WebAuthn credential is never stored here; only enrollment/status metadata.
- `access_reviews` — append-style log for the access-review dashboard (§4).
- `audit_logs` — append-only (no UPDATE/DELETE policy exists for any role);
  records actor, organisation, practice, role-at-time, outcome, IP, user
  agent and reason per §13.

## Known gaps / follow-ups (not yet fixed)

- Several `SECURITY DEFINER` helper functions (`is_admin`, `is_ecl_staff`,
  etc.) are still exposed as PostgREST RPC endpoints because they live in
  the `public` schema. They only ever return a boolean about the *calling*
  user, so this isn't a data-exposure bug, but best practice is to move them
  to a non-exposed schema so they aren't directly callable over the API.
  Flagged for a dedicated follow-up migration rather than done inline here,
  since it touches every RLS policy that references them.
- `practices.organisation_id` is nullable and unpopulated for existing
  practices — a Stage 3 backfill workflow should create/attach a
  `referring_practice` organisation per practice.
- The referrals `UPDATE` policy grants any ECL staff member row-level
  access; the finer "only ECL Clinical Users can set clinical statuses"
  restriction from §6 must be enforced in the Next.js server-action layer,
  since RLS can't cheaply express "is this specific status transition a
  clinical one" without a `referral_statuses.requires_clinical_role`-style
  column that hasn't been added yet.
