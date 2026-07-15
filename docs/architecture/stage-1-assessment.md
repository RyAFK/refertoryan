# ReturnToRyan — Stage 1: Security & Architecture Assessment

**Status:** Draft for review. This is an engineering assessment, not a legal, clinical-safety or
regulatory sign-off. Nothing in this document should be described as "compliant" or "approved."

**Scope of this document:** items 1–12 of the requested delivery format (current-state risks,
proposed architecture, data flow, role/permission matrix, proposed schema, hazard register,
implementation phases, files to create/modify, external services required, governance actions,
launch blockers, open questions).

---

## 1. Current-state risks

The existing codebase (`src/App.jsx` + `src/referral-assistant/*` + `src/clinical-education/*`) is
a **client-only Vite/React demo**. It has no backend, no database, and no network calls at all
(`fetch`/`axios`/cookies/localStorage all absent). Concretely:

| # | Finding | Risk if used for real patients |
|---|---|---|
| R1 | No backend exists. "Submitting" a referral (`ReferWizard.submit`, `App.jsx`) only sets in-memory React state and vanishes on refresh. | None *today* because nothing persists — but this means **zero** of the required controls (auth, audit, encryption, RBAC) exist to build on. |
| R2 | "Sign-in" is a fixed team code (`ecl1234`) and a "bypass sign-in (preview)" button, per `README.md`. No password, no identity, no MFA. | Anyone with the URL can reach every screen, including the clinic-side dashboard mockups. |
| R3 | No concept of organisation, practice, or role. All UI branches are client-side `useState` toggles. | No server-side authorisation exists to violate yet, but also nothing to migrate — RBAC is greenfield. |
| R4 | File "upload" (`ReferWizard` step 3) stores raw `File` objects in component state only; never transmitted or scanned. | Not a live risk today, but the UX implies persistence/security that doesn't exist — misleading if used as-is. |
| R5 | No audit trail, no logging, no error boundary, no monitoring. | No forensic capability; nothing to detect misuse if this were connected to real data by mistake. |
| R6 | No environment separation — one Vite static build, one config. | High risk of a future "just add a database" change accidentally wiring demo UI straight to production data with no gate. |
| R7 | Marketing/demo content (Trustpilot widget, CPD events, "Book a conversation with Ryan") is interleaved with clinical workflow UI in the same 2,561-line file. | Increases risk of clinical and marketing/commercial data being conflated later (relevant to §15 consent separation). |
| R8 | No dependency scanning, no tests, no CI. | Can't currently detect regressions or known-vulnerable packages. |
| R9 | No accessibility testing evidence despite decorative animation, colour-only status pills in places (`Pill` tone colours), and custom form controls. | WCAG 2.2 AA gap unknown until audited. |

**Bottom line:** there is no real security boundary to breach today because there is no backend —
but that also means every control in the brief (§1–§33) must be built new. This is not a
refactor; it is a **new backend-and-data-layer build** underneath an existing UI shell, plus a UI
rework to remove marketing/clinical conflation and connect real workflows.

---

## 2. Proposed production architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         Next.js 14+ (TypeScript, App Router)            │
│  ┌───────────────┐  ┌────────────────────┐  ┌─────────────────────┐    │
│  │ Public/marketing│  │ Referring Partner  │  │ ECL Internal        │    │
│  │ routes (no PII) │  │ app (authenticated)│  │ app (authenticated) │    │
│  └───────────────┘  └────────────────────┘  └─────────────────────┘    │
│                     Server Components + Server Actions                  │
│                     ─── never fetch client-side for clinical data ───   │
├─────────────────────────────────────────────────────────────────────────┤
│  Security middleware: session check, MFA-step-up, CSRF, security        │
│  headers, rate limiting, request logging (redacted), org/role gate      │
├─────────────────────────────────────────────────────────────────────────┤
│  API routes / Server Actions (all server-side authorised, per §20)      │
├───────────────┬───────────────┬───────────────┬─────────────────────────┤
│ Auth provider │ PostgreSQL     │ Object storage │ Background jobs        │
│ (MFA, sessions,│ via Prisma    │ (encrypted,    │ (malware scan,         │
│ audit hooks)  │ (RLS + app-   │ signed URLs,   │ notification dispatch,  │
│               │ level checks) │ private only)  │ escalation timers)      │
├───────────────┴───────────────┴───────────────┴─────────────────────────┤
│  Structured, redacted logging → error monitoring (PII-scrubbed)         │
│  Immutable audit event store (append-only, separate from app data)      │
└─────────────────────────────────────────────────────────────────────────┘
```

**Environments:** three fully separate deployments (`development`, `staging`, `production`), each
with its own database, storage bucket, auth tenant, and secrets. Production requires a startup
health-check that **refuses to boot** if required secrets/flags are missing (§2 production-mode
safeguards) — implemented as a `assertProductionReadiness()` check run at process start.

**Suggested stack (needs your confirmation — see questions at the end):**

- **Framework:** Next.js (App Router) + TypeScript, deployed as a Node server (not static export) so server-only code can never ship to the client.
- **Database:** PostgreSQL, accessed only via Prisma from server code. Row-level security as defence-in-depth under application-level checks (never RLS-only).
- **Auth:** a managed provider with native MFA + session management (e.g. Supabase Auth or Auth0/WorkOS) rather than hand-rolled crypto. You have Supabase MCP tools available in this session, which would also cover Postgres + storage in one provider — flagged as an option below, not decided.
- **Object storage:** private bucket (S3-compatible or Supabase Storage) with server-issued short-lived signed URLs only; no public bucket policy.
- **Background jobs:** queue/cron for malware-scan callbacks, escalation timers, notification dispatch (e.g. a hosted queue or scheduled serverless functions — provider TBC).
- **Secrets:** platform secret manager (e.g. Vercel/hosting-provider env vars for app secrets, plus a KMS for field-level encryption keys) — never committed, never in client bundles.

---

## 3. Data-flow diagram

```mermaid
flowchart LR
    subgraph Referrer["Referring Optometrist (browser)"]
        RB[Browser session]
    end
    subgraph ECLUser["ECL Clinical / Admin User (browser)"]
        EB[Browser session]
    end

    RB -- "HTTPS + auth cookie (HttpOnly/Secure/SameSite)" --> MW
    EB -- "HTTPS + auth cookie" --> MW

    subgraph App["Next.js server"]
        MW[Security middleware\nsession + MFA + CSRF + rate limit]
        MW --> AuthZ[Server-side authorisation\norg/practice/role/relationship check]
        AuthZ --> API[API routes / server actions]
        API --> Audit[Audit event writer]
    end

    API -- "Prisma, parameterised" --> DB[(PostgreSQL\nencrypted at rest)]
    API -- "signed PUT/GET only" --> Storage[(Object storage\nencrypted, private)]
    API -- "queue job" --> Scan[Malware scan worker]
    Scan -- "quarantine / release" --> Storage
    API -- "generic message only, no PII" --> Notify[Email/SMS provider]
    Notify -- "\"sign in to view\" only" --> RB
    Notify -- "\"sign in to view\" only" --> EB
    Audit --> AuditDB[(Append-only audit store)]
    API --> Monitor[Error monitoring\nPII-redacted]

    DB -. "backup job, encrypted" .-> Backup[(Encrypted backups)]
```

**Trust boundaries:**
1. Browser ↔ server (untrusted input; every field validated server-side).
2. Referring-practice user ↔ ECL-internal data (organisation/practice boundary; enforced in every query, not just UI).
3. Server ↔ storage (server issues signed URLs; storage never reachable directly by browser except via those URLs).
4. Server ↔ external notification providers (one-way, PII-stripped payload only).
5. Server ↔ audit store (write-only for ordinary app code; no delete/update path exposed to app roles).
6. Demo mode ↔ production mode (separate connection strings/secrets; demo build must be structurally unable to resolve production credentials — see §2 safeguards, implemented via distinct env files and a boot-time assertion, not a runtime toggle).

---

## 4. Role and permission matrix

Access = `organisation × practice × role × relationship-to-patient/referral × minimum-necessary`.
Below is the baseline matrix; fine-grained note-visibility (§8) and urgent-alert acknowledgement
(§10) layer on top per-record.

| Capability | ECL Sys Admin | ECL Clinical User | ECL Referral Coordinator | ECL Read-Only Auditor | Practice Admin | Referring Optometrist | Practice Read-Only |
|---|---|---|---|---|---|---|---|
| Manage users/roles/orgs | ✅ | ❌ | ❌ | ❌ | Practice-scoped only (invite/suspend own practice users) | ❌ | ❌ |
| View all referrals (any practice) | ✅ (admin context, logged) | ✅ | ✅ | ✅ (read-only) | ❌ | ❌ | ❌ |
| View own-practice referrals | — | — | — | — | ✅ | ✅ (own submitted/shared) | ✅ (view only) |
| Create referral | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ |
| Update clinical status (e.g. "Under Clinical Review") | ❌ (not clinical) | ✅ | ❌ (admin statuses only, e.g. "Received") | ❌ | ❌ | ❌ | ❌ |
| Update administrative status (e.g. "Consultation Booked") | ❌ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Write clinical note | ❌ | ✅ | Admin-category notes only | ❌ | ❌ | ✅ (referrer-supplied category only) | ❌ |
| Read clinical note | Per visibility | Per visibility | Per visibility | ✅ (read-only, logged) | Per visibility + practice scope | Per visibility + own referral | ✅ (view only, per visibility) |
| Add addendum to own note | ❌ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Upload attachment | ❌ | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Download attachment | Logged | ✅ | ✅ | ✅ (logged) | Practice scope | Own referral | View-only preview, no download |
| Acknowledge urgent clinical alert | ❌ | ✅ | ❌ (can escalate, not acknowledge clinically) | ❌ | ❌ | ❌ | ❌ |
| Patient merge | ❌ (requires clinical/admin review workflow) | Review participant | Review participant | ❌ | ❌ | ❌ | ❌ |
| View audit log | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Export data (bulk) | ✅ (approval workflow) | ❌ | Small exports w/ reason | ✅ (read-only export, logged) | ❌ | ❌ (own single referral only) | ❌ |
| Access-review dashboard | ✅ | ❌ | ❌ | ✅ (view only) | ❌ | ❌ | ❌ |
| Incident management module | ✅ | Assigned only | ❌ | ✅ (view only) | ❌ | ❌ | ❌ |
| Data-rights request handling | ✅ | Assigned only | ❌ | ✅ (view only) | ❌ | ❌ | ❌ |
| Change own role/org/practice | ❌ (nobody can) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

Every row above must be enforced **server-side** on every request (§20) — the matrix drives
middleware/authorisation-helper design, not just UI conditionals.

---

## 5. Proposed database schema (overview)

Full runnable `prisma/schema.prisma` will be produced in Stage 2. Overview of the ~35 models
requested in §30, grouped:

- **Identity & access:** `User`, `Role`, `Permission`, `Organisation`, `Practice`, `PracticeMembership`, `UserSession`, `MFAConfiguration`, `AccessReview`.
- **Patient & referral:** `Patient`, `PatientIdentifier`, `Referral`, `ReferralStatusHistory`, `ReferralUrgency`.
- **Clinical record:** `ClinicalNote`, `ClinicalNoteVersion`, `ClinicalAcknowledgement`, `Attachment`, `AttachmentScan`.
- **Communication:** `SecureMessage`, `MessageRecipient`, `Notification`.
- **Governance & safety:** `ConsentRecord`, `PrivacyNoticeVersion`, `PatientPrivacyAcknowledgement`, `DataExport`, `DataRightsRequest`, `DataBreach`, `RetentionPolicy`, `LegalHold`, `ClinicalHazard`, `ClinicalSafetyDocument`.
- **Security & platform:** `AuditEvent`, `SecurityEvent`, `IntegrationTransfer`, `IntegrationFailure`.

Design rules applied throughout:
- Every model: `createdAt`, `updatedAt`, `createdById` (nullable only for system events), `organisationId` and `practiceId` where relevant.
- No plaintext secrets: `User` never stores a password (delegated to auth provider) or, if self-managed, stores only a hash (argon2id) + MFA reference — never the TOTP secret in plaintext (encrypted at the application layer).
- `ClinicalNote` is append-only: edits happen only via `ClinicalNoteVersion`/addendum rows, never `UPDATE` on clinical content.
- `AuditEvent` has no `updatedAt` and no application-level delete/update permission — enforced both by Prisma client restrictions and DB-level `REVOKE UPDATE, DELETE`.
- Soft delete (`deletedAt`) used only for operational entities (e.g. `Notification`, draft `Referral`), never for submitted clinical content — clinical content uses status/lifecycle fields instead, never deletion.
- Indexes on all foreign keys plus `(organisationId, practiceId)` composite indexes on patient-facing tables to make the org/practice filter cheap and mandatory-by-default in query helpers.

---

## 6. Clinical hazard register (initial draft — requires CSO review)

**This is a draft skeleton, not a completed hazard log.** Likelihood/severity/risk scoring,
controls verification, and approval must be completed by a named Clinical Safety Officer per
DCB0129 before this can inform a safety case.

| Hazard | Cause (example) | Potential harm | Initial risk | Proposed control | Residual risk | Owner |
|---|---|---|---|---|---|---|
| Referral not received | Network/storage failure, silent submit error | Delayed diagnosis/treatment | TBC — CSO | Server-side submission confirmation + delivery status shown to referrer; failed-submission alerting | TBC | CSO |
| Referral sent to wrong organisation | Practice/org mis-selection, session mix-up | Wrong-site treatment planning, confidentiality breach | TBC | Org/practice bound to authenticated session, not user-selectable at submission | TBC | CSO |
| Information attached to wrong patient | Duplicate patient, manual entry error | Misdiagnosis, wrong treatment | TBC | Duplicate-check + confirmation screen (§5); referral/attachment always bound server-side to a single `patientId` | TBC | CSO |
| Urgent referral not acknowledged | No escalation mechanism | Delayed emergency care | TBC | Mandatory ack workflow + timer-based escalation (§9, §10) | TBC | CSO |
| Missing diagnostic attachment | Upload failure not surfaced | Incomplete clinical picture | TBC | Upload confirmation + malware-scan status visible; referral cannot be marked "Submitted" with a failed upload silently dropped | TBC | CSO |
| Corrupted attachment | Storage/transfer error | Misread clinical images | TBC | File-signature validation on upload + checksum verification on retrieval | TBC | CSO |
| Incorrect status update | User error, race condition | Wrong expectations set for referrer/patient | TBC | Full status-history audit trail; only authorised roles per matrix (§6 workflow) | TBC | CSO |
| Duplicate patient | Independent entry by two practices | Fragmented record, conflicting notes | TBC | Duplicate warning + no auto-merge; manual reviewed merge only (§5) | TBC | CSO |
| Incomplete clinical history | Optional fields left blank | Incomplete triage | TBC | Mandatory-field validation on submit; visible "information requested" workflow | TBC | CSO |
| Incorrect user access | Role misconfiguration | Confidentiality breach | TBC | Server-side checks on every request, access-review dashboard, periodic review | TBC | CSO |
| System unavailable | Outage | Delayed referral | TBC | Availability monitoring, documented BCP | TBC | CSO |
| Notification failure | Email/SMS provider outage | Referrer/patient unaware of update | TBC | Failed-notification dashboard + retry + audit | TBC | CSO |
| Clinical note wrongly marked as reviewed | UI conflates "viewed" with "acknowledged" | False assurance of clinical review | TBC | Explicit distinct states: submitted/delivered/viewed/acknowledged/actioned (§9) | TBC | CSO |
| Referrer relying on automated pathway recommendation | Referral Assistant output misunderstood as diagnosis | Inappropriate care pathway | TBC | Non-diagnostic wording enforced in UI copy, no image analysis, human override always available (§25) | TBC | CSO |
| Conflicting information between ReturnToRyan and ECL's main clinical record | No sync/reconciliation | Clinician acts on stale/wrong data | TBC | Authoritative-record flag, integration/transfer status, reconciliation workflow (§26) | TBC | CSO |

A full `ClinicalHazard` table (per §30) will let the CSO score and approve these inside the app
rather than in this document.

---

## 7. Implementation phases

Matches §34's five stages; sized realistically for a session-by-session build rather than one
pass:

1. **Stage 1 — this document.**
2. **Stage 2 — Foundation:** Next.js/TS scaffold, Prisma schema + migrations, org/practice/role model, auth provider integration + MFA, server-side authorisation helper, audit-event writer, security headers/middleware, rate limiting, environment-separation guardrails (demo vs production boot checks).
3. **Stage 3 — Secure clinical referrals:** patient identity + duplicate checks, referral workflow + status history, clinical notes (append-only + addenda), file upload pipeline (validation → quarantine → scan → release → signed URLs), secure messaging, acknowledgement workflow, urgent-referral escalation.
4. **Stage 4 — Governance and safety:** `/governance` templates, hazard log + clinical-safety module (as data, not just docs), incident management, retention/legal-hold model, data-rights workflows, access-review dashboard, supplier/subprocessor register.
5. **Stage 5 — Testing and release readiness:** automated security/regression tests (per §28), dependency/secret/static scanning wired into CI, backup-restore and BCP test plans, production-readiness report (§35 categories).

Each stage will be delivered as its own reviewable commit set rather than one giant diff, so you
can redirect scope between stages.

---

## 8. Files to create or modify (Stage 2 starting set)

This is the initial file list for Stage 2 — later stages will add substantially more:

- `package.json`, `tsconfig.json`, `next.config.ts` — replace Vite config with Next.js.
- `prisma/schema.prisma` — full schema per §30.
- `src/lib/auth/*` — auth provider integration, session helpers, MFA enforcement.
- `src/lib/authz/*` — server-side permission-matrix enforcement helpers (used by every API route/server action).
- `src/lib/audit/*` — audit-event writer (append-only).
- `src/lib/env/*` — environment/secret validation, `assertProductionReadiness()`.
- `middleware.ts` — security headers, CSRF, rate limiting, session/MFA gating.
- `src/app/**` — route groups for public marketing, referring-partner app, ECL-internal app (migrating relevant UI out of the current monolithic `src/App.jsx`).
- `.env.example`, `.env.development.example`, `.env.production.example` (no secrets committed).
- `docs/architecture/*` (this document and successors).
- Existing `src/clinical-education/*`, `src/referral-assistant/*` — retained and adapted, not discarded; Referral Assistant needs the non-diagnostic guardrails from §25 added explicitly.

Existing marketing-only content (Trustpilot carousel, CPD/news, success stories) is out of scope
for clinical-safety work but will move to public, unauthenticated routes with no patient data path
nearby, per R7 above.

---

## 9. External services required (decisions needed from you)

None of these are provisioned yet. Flagged here because each is a real contract/cost decision,
not something I should pick unilaterally:

- **Hosting** (e.g. Vercel, or another Node-capable host with UK/EU data residency).
- **Auth provider** with native MFA (e.g. Supabase Auth, Auth0, WorkOS).
- **Database host** — PostgreSQL, ideally UK/EU region (e.g. Supabase, RDS, Azure Database for PostgreSQL).
- **Object storage** — S3-compatible, private bucket, UK/EU region.
- **Malware scanning** for uploads (e.g. ClamAV-based service or a cloud AV API).
- **Email provider** for the PII-free "sign in to view" notifications only.
- **SMS provider** (same constraint) — only if SMS notification is actually wanted; not mandatory.
- **Error monitoring** with PII-redaction support (e.g. Sentry with scrubbing configured) — must never receive clinical content.
- **Backup provider/strategy** if not bundled with the DB host.

I have Supabase MCP tools available in this session, which could plausibly cover auth + Postgres +
storage as a single UK/EU-capable provider — but I won't provision a real project without you
confirming that's the direction, since it has cost and data-residency implications.

---

## 10. Governance actions that cannot be solved through code

These require named, qualified humans and cannot be satisfied by shipping code:

- Appointing a named **Clinical Safety Officer** (DCB0129) to own and approve the hazard log and safety case.
- **DPIA** completion and sign-off by a qualified Data Protection Officer / information-governance lead.
- **Legal review** of the patient privacy notice, referring-practice terms, and any Data Processing/Sharing Agreements with suppliers (auth/storage/email/SMS providers).
- **ICO registration** and confirmation of lawful basis documentation (this system supports Article 6/9 processing records; it does not decide lawful basis for you).
- **Supplier due diligence and contracts** (DPAs) for every external service selected in §9.
- **Retention periods** — must be set by ECL's information-governance lead, not hard-coded (the platform will only make them *configurable*).
- **Staff training** on the platform, confidentiality duties, and incident reporting before go-live.
- **Independent penetration test** before production launch, plus a remediation log.
- **MHRA SaMD assessment** if/when the Referral Assistant or any future feature moves beyond non-diagnostic guidance (§25).
- **Business continuity / disaster recovery plans** — the platform provides technical backup/restore capability; the organisational plan and rehearsal is a governance activity.
- **CQC Regulation 17 evidence pack** — the system supports record-keeping controls; demonstrating organisational compliance is not a code deliverable.

---

## 11. Production launch blockers

Non-negotiable before any real patient data touches this system:

1. No backend/auth/RBAC/audit exists yet — Stages 2–3 must be complete and tested.
2. No CSO-approved hazard log or safety case (§24).
3. No DPIA, ROPA, or legal-reviewed privacy notice (§15, §29).
4. No independent penetration test performed.
5. No confirmed hosting/auth/storage suppliers with signed DPAs and confirmed UK/EU data residency.
6. No retention schedule approved by an information-governance lead.
7. No MFA, no encrypted storage, no audit logging implemented (all Stage 2/3 work).
8. Demo/production separation not yet built — currently there is only one undifferentiated demo build.
9. No accessibility audit against WCAG 2.2 AA.
10. No staff training or access-review process yet operational.

---

## 12. Questions and assumptions to be documented

1. **Auth/DB/storage provider** — do you want me to provision a real Supabase project via the MCP tools now (this session has that capability), or scaffold the code against a provider-agnostic interface first and defer provisioning? Provisioning has cost/data-residency implications I shouldn't decide for you.
2. **Self-registration** — §2 requires public self-registration to be disabled unless an ECL administrator explicitly enables it. Assumption: disabled by default; ECL admins create/approve referring-practice accounts. Please confirm.
3. **NHS number handling** — is NHS number always required, sometimes required, or out of scope for v1? This affects `PatientIdentifier` validation rules (NHS number check-digit validation) and DSPT/data-security scope.
4. **SMS** — is SMS notification actually needed for v1, or is email-only (PII-free) sufficient? Adding SMS adds a supplier and cost with no functional gain if email covers it.
5. **Existing marketing content** (Trustpilot, CPD events, "Book a conversation with Ryan," August offer modal) — keep as public marketing pages alongside the secure app, under a clearly separate route group with no shared state with clinical screens? Assumption: yes, kept but structurally isolated.
6. **"Bypass sign-in (preview)"** — this must be removed entirely once real auth exists, including from any build reachable outside a controlled demo environment. Confirming that's understood and acceptable.
7. **Timeline/scope expectations** — this brief is roughly a multi-month, multi-engineer programme of work compressed into a single specification. I'll build it stage-by-stage across sessions with reviewable checkpoints rather than attempt the whole system at once; flagging this now so scope/pace expectations are aligned.

---

*Prepared as an engineering assessment only. Does not constitute legal, clinical-safety, or
regulatory advice or approval.*
