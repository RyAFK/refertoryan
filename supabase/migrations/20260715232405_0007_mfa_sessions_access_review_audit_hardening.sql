-- Adds the remaining Stage 2 foundation tables: a practice-side read-only
-- role, MFA configuration tracking, server-visible session records (so
-- sessions can be listed/revoked per §3/§4), an access-review log, and
-- widens audit_logs to the fields required by §13.

alter type public.practice_role add value if not exists 'read_only';

comment on type public.practice_role is
  'practice_owner/practice_admin map to "Referring Practice Administrator"; optometrist/locum_optometrist/dispensing_optician map to "Referring Optometrist"-tier access; read_only/team_member map to "Referring Practice Read-Only User". Enforced in the application authorisation layer, not by this comment.';

-- --- MFA configuration -------------------------------------------------
create table public.mfa_configurations (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  method text not null check (method in ('totp', 'webauthn', 'recovery_code')),
  is_active boolean not null default true,
  enrolled_at timestamptz not null default now(),
  last_used_at timestamptz,
  disabled_at timestamptz,
  disabled_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.mfa_configurations enable row level security;

create policy mfa_configurations_select_own_or_admin on public.mfa_configurations for select
  using (profile_id = auth.uid() or is_admin());
create policy mfa_configurations_admin_write on public.mfa_configurations for insert
  with check (is_admin() or profile_id = auth.uid());
create policy mfa_configurations_admin_update on public.mfa_configurations for update
  using (is_admin())
  with check (is_admin());

comment on table public.mfa_configurations is
  'Tracks that a factor was enrolled and its status only. The actual TOTP secret / WebAuthn credential lives with the auth provider, never in this table.';

-- --- Server-visible sessions (list/revoke, §3/§4) -----------------------
create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  auth_session_id text not null,
  ip_address text,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references public.profiles(id),
  revoked_reason text
);

alter table public.user_sessions enable row level security;
create unique index user_sessions_auth_session_id_key on public.user_sessions(auth_session_id);

create policy user_sessions_select_own_or_admin on public.user_sessions for select
  using (profile_id = auth.uid() or is_admin());
create policy user_sessions_insert_own on public.user_sessions for insert
  with check (profile_id = auth.uid() or is_admin());
create policy user_sessions_update_own_or_admin on public.user_sessions for update
  using (profile_id = auth.uid() or is_admin())
  with check (profile_id = auth.uid() or is_admin());

-- --- Access review log (§4 access-review dashboard) ----------------------
create table public.access_reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  action text not null check (action in (
    'granted', 'role_changed', 'practice_changed', 'suspended', 'reactivated',
    'session_revoked', 'access_disabled', 'reviewed_no_change'
  )),
  reason text not null,
  performed_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.access_reviews enable row level security;

create policy access_reviews_select_admin_or_auditor on public.access_reviews for select
  using (is_admin() or is_read_only_auditor());
create policy access_reviews_insert_admin on public.access_reviews for insert
  with check (is_admin());

-- --- Audit log hardening (§13) -------------------------------------------
alter table public.audit_logs
  add column organisation_id uuid references public.organisations(id),
  add column practice_id uuid references public.practices(id),
  add column role_at_time public.user_role,
  add column outcome text not null default 'success' check (outcome in ('success', 'failure')),
  add column ip_address text,
  add column user_agent text,
  add column reason text;

comment on table public.audit_logs is
  'Append-only: RLS has no UPDATE or DELETE policy for any role, so ordinary application roles cannot modify or delete audit events once inserted.';

create index audit_logs_organisation_id_idx on public.audit_logs(organisation_id);
create index audit_logs_practice_id_idx on public.audit_logs(practice_id);
create index audit_logs_created_at_idx on public.audit_logs(created_at);
create index audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
