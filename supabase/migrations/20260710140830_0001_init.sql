-- ECL Partner Portal — Initial schema

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================
create type user_role as enum ('partner', 'admin', 'super_admin');
create type account_status as enum ('pending', 'active', 'suspended', 'rejected', 'deactivated');
create type practice_role as enum ('practice_owner', 'practice_admin', 'optometrist', 'dispensing_optician', 'locum_optometrist', 'team_member');
create type document_visibility as enum ('partner_and_admin', 'admin_only');
create type note_visibility as enum ('partner_visible', 'internal');
create type announcement_status as enum ('draft', 'published');
create type follow_up_type as enum ('phone_call', 'email', 'practice_visit', 'cpd_event', 'meeting', 'other');
create type partner_status as enum ('highly_active', 'active', 'new', 'growing', 'declining', 'dormant', 'at_risk');

-- ============================================================================
-- CORE REFERENCE / IDENTITY TABLES
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'partner',
  status account_status not null default 'pending',
  first_name text not null,
  last_name text not null,
  professional_title text,
  professional_role text,
  goc_number text,
  contact_number text,
  email text not null,
  avatar_url text,
  mfa_required boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_status on profiles(status);
create index idx_profiles_role on profiles(role);

create table practices (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address_line_1 text,
  address_line_2 text,
  town_city text,
  postcode text,
  telephone text,
  email text,
  website text,
  main_contact_name text,
  practice_notes text, -- admin-only, never selected into partner-facing queries
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  archived_at timestamptz
);

create table practice_memberships (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references practices(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  practice_role practice_role not null default 'optometrist',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  unique (practice_id, profile_id)
);
create index idx_membership_profile on practice_memberships(profile_id) where is_active;
create index idx_membership_practice on practice_memberships(practice_id) where is_active;

-- ============================================================================
-- TREATMENT / REFERRAL TAXONOMY
-- ============================================================================

create table treatment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  description text,
  icon text,
  display_order int not null default 0,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table referral_statuses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  display_order int not null default 0,
  is_terminal boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PATIENTS / REFERRALS
-- ============================================================================

create table patients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  email text,
  telephone text,
  preferred_contact_method text,
  address_line_1 text,
  address_line_2 text,
  town_city text,
  postcode text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table referrals (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  patient_id uuid not null references patients(id),
  practice_id uuid not null references practices(id),
  treatment_type_id uuid not null references treatment_types(id),
  created_by uuid not null references profiles(id),
  current_status_id uuid not null references referral_statuses(id),

  reason_for_referral text,
  presenting_symptoms text,
  patient_visual_goals text,
  ocular_history text,
  medical_history text,
  current_medications text,
  allergies text,
  unaided_visual_acuity text,
  best_corrected_visual_acuity text,
  spectacle_prescription text,
  refraction text,
  intraocular_pressure text,
  additional_clinical_notes text,

  patient_consent_confirmed boolean not null default false,

  referred_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);
create index idx_referrals_practice on referrals(practice_id);
create index idx_referrals_status on referrals(current_status_id);
create index idx_referrals_created_by on referrals(created_by);
create index idx_referrals_referred_at on referrals(referred_at);

create table referral_status_history (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  previous_status_id uuid references referral_statuses(id),
  new_status_id uuid not null references referral_statuses(id),
  effective_date date not null default current_date,
  changed_by uuid not null references profiles(id),
  partner_visible_note text,
  internal_note text,
  notified_partner boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_status_history_referral on referral_status_history(referral_id);

create table referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  event_type text not null,
  title text not null,
  event_date date not null,
  event_time time,
  clinician text,
  location text,
  partner_visible_description text,
  internal_description text,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_events_referral on referral_events(referral_id);

create table referral_notes (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  visibility note_visibility not null,
  content text not null,
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
create index idx_notes_referral on referral_notes(referral_id, visibility);

create table referral_documents (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references referrals(id) on delete cascade,
  practice_id uuid not null references practices(id),
  uploaded_by uuid not null references profiles(id),
  original_filename text not null,
  storage_path text not null unique,
  mime_type text not null,
  file_size_bytes bigint not null,
  category text not null,
  visibility document_visibility not null default 'partner_and_admin',
  created_at timestamptz not null default now()
);
create index idx_documents_referral on referral_documents(referral_id, visibility);

-- ============================================================================
-- EDUCATION / ANNOUNCEMENTS / NOTIFICATIONS
-- ============================================================================

create table education_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  speaker_name text,
  duration_seconds int,
  provider text not null default 'youtube',
  video_url text,
  storage_path text,
  thumbnail_url text,
  is_featured boolean not null default false,
  published_at timestamptz,
  archived_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create table announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text,
  category text not null,
  featured_image_url text,
  status announcement_status not null default 'draft',
  priority int not null default 0,
  audience text not null default 'all',
  publish_at timestamptz,
  expire_at timestamptz,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null,
  related_entity_type text,
  related_entity_id uuid,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

-- ============================================================================
-- ADMIN-ONLY / INTERNAL COMMERCIAL TABLES
-- ============================================================================

create table partner_internal_notes (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references practices(id) on delete cascade,
  content text not null,
  relationship_status text,
  account_priority text,
  bdm_owner uuid references profiles(id),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table account_follow_ups (
  id uuid primary key default gen_random_uuid(),
  practice_id uuid not null references practices(id) on delete cascade,
  contact_name text,
  follow_up_type follow_up_type not null,
  follow_up_date date not null,
  notes text,
  outcome text,
  next_follow_up_date date,
  responsible_person uuid references profiles(id),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  ip_metadata text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_created on audit_logs(created_at);
create index idx_audit_entity on audit_logs(entity_type, entity_id);

create table system_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

-- ============================================================================
-- updated_at TRIGGER
-- ============================================================================
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated before update on profiles for each row execute function set_updated_at();
create trigger trg_practices_updated before update on practices for each row execute function set_updated_at();
create trigger trg_referrals_updated before update on referrals for each row execute function set_updated_at();
create trigger trg_announcements_updated before update on announcements for each row execute function set_updated_at();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

create or replace function current_profile_role()
returns user_role
language sql stable security definer set search_path = public as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role in ('admin', 'super_admin') and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function is_active_partner()
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select role = 'partner' and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function has_practice_access(target_practice_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from practice_memberships pm
    join profiles p on p.id = pm.profile_id
    where pm.practice_id = target_practice_id
      and pm.profile_id = auth.uid()
      and pm.is_active = true
      and p.status = 'active'
  ) or is_admin();
$$;

create or replace function has_referral_access(target_referral_id uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select is_admin() or exists (
    select 1 from referrals r
    where r.id = target_referral_id
      and has_practice_access(r.practice_id)
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

alter table profiles enable row level security;
alter table profiles force row level security;
alter table practices enable row level security;
alter table practices force row level security;
alter table practice_memberships enable row level security;
alter table practice_memberships force row level security;
alter table treatment_types enable row level security;
alter table referral_statuses enable row level security;
alter table patients enable row level security;
alter table patients force row level security;
alter table referrals enable row level security;
alter table referrals force row level security;
alter table referral_status_history enable row level security;
alter table referral_status_history force row level security;
alter table referral_events enable row level security;
alter table referral_events force row level security;
alter table referral_notes enable row level security;
alter table referral_notes force row level security;
alter table referral_documents enable row level security;
alter table referral_documents force row level security;
alter table education_videos enable row level security;
alter table announcements enable row level security;
alter table notifications enable row level security;
alter table notifications force row level security;
alter table partner_internal_notes enable row level security;
alter table partner_internal_notes force row level security;
alter table account_follow_ups enable row level security;
alter table account_follow_ups force row level security;
alter table audit_logs enable row level security;
alter table audit_logs force row level security;
alter table system_settings enable row level security;

create policy profiles_select_own_or_admin on profiles for select
  using (id = auth.uid() or is_admin());
create policy profiles_update_own_limited on profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());
create policy profiles_admin_all on profiles for all
  using (is_admin()) with check (is_admin());

create policy practices_select on practices for select
  using (has_practice_access(id));
create policy practices_admin_write on practices for insert with check (is_admin());
create policy practices_admin_update on practices for update using (is_admin()) with check (is_admin());

create policy memberships_select on practice_memberships for select
  using (profile_id = auth.uid() or is_admin());
create policy memberships_admin_write on practice_memberships for insert with check (is_admin());
create policy memberships_admin_update on practice_memberships for update using (is_admin()) with check (is_admin());

create policy treatment_types_select on treatment_types for select using (auth.uid() is not null);
create policy treatment_types_admin_write on treatment_types for insert with check (is_admin());
create policy treatment_types_admin_update on treatment_types for update using (is_admin()) with check (is_admin());
create policy statuses_select on referral_statuses for select using (auth.uid() is not null);
create policy statuses_admin_write on referral_statuses for insert with check (is_admin());

create policy patients_select on patients for select
  using (
    is_admin() or exists (
      select 1 from referrals r where r.patient_id = patients.id and has_practice_access(r.practice_id)
    )
  );
create policy patients_insert on patients for insert
  with check (is_active_partner() or is_admin());

create policy referrals_select on referrals for select
  using (has_practice_access(practice_id));
create policy referrals_insert on referrals for insert
  with check ((is_active_partner() and has_practice_access(practice_id)) or is_admin());
create policy referrals_admin_update on referrals for update
  using (is_admin()) with check (is_admin());

create policy status_history_select on referral_status_history for select
  using (has_referral_access(referral_id));
create policy status_history_admin_insert on referral_status_history for insert
  with check (is_admin());

create policy events_select on referral_events for select
  using (has_referral_access(referral_id));
create policy events_admin_insert on referral_events for insert
  with check (is_admin());

create policy notes_select on referral_notes for select
  using (
    (visibility = 'partner_visible' and has_referral_access(referral_id))
    or (visibility = 'internal' and is_admin())
  );
create policy notes_insert on referral_notes for insert
  with check (
    (visibility = 'partner_visible' and (is_admin() or has_referral_access(referral_id)))
    or (visibility = 'internal' and is_admin())
  );

create policy documents_select on referral_documents for select
  using (
    (visibility = 'partner_and_admin' and has_referral_access(referral_id))
    or (visibility = 'admin_only' and is_admin())
  );
create policy documents_insert on referral_documents for insert
  with check (has_referral_access(referral_id));
create policy documents_admin_update on referral_documents for update
  using (is_admin()) with check (is_admin());

create policy videos_select on education_videos for select
  using (archived_at is null and (published_at is not null and published_at <= now()) or is_admin());
create policy videos_admin_write on education_videos for insert with check (is_admin());
create policy videos_admin_update on education_videos for update using (is_admin()) with check (is_admin());

create policy announcements_select on announcements for select
  using ((status = 'published' and (expire_at is null or expire_at > now())) or is_admin());
create policy announcements_admin_write on announcements for insert with check (is_admin());
create policy announcements_admin_update on announcements for update using (is_admin()) with check (is_admin());

create policy notifications_select_own on notifications for select using (user_id = auth.uid());
create policy notifications_update_own on notifications for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy notifications_admin_insert on notifications for insert with check (true);

create policy internal_notes_admin_only on partner_internal_notes for all using (is_admin()) with check (is_admin());
create policy follow_ups_admin_only on account_follow_ups for all using (is_admin()) with check (is_admin());
create policy audit_admin_only on audit_logs for select using (is_admin());
create policy audit_insert on audit_logs for insert with check (true);
create policy settings_admin_only on system_settings for all using (is_admin()) with check (is_admin());

-- ============================================================================
-- SEED: reference data
-- ============================================================================

insert into referral_statuses (code, label, display_order, is_terminal) values
  ('referral_received', 'Referral Received', 1, false),
  ('contact_attempted', 'Patient Contact Attempted', 2, false),
  ('consultation_booked', 'Consultation Booked', 3, false),
  ('consultation_completed', 'Consultation Completed', 4, false),
  ('treatment_recommended', 'Treatment Recommended', 5, false),
  ('patient_considering', 'Patient Considering', 6, false),
  ('treatment_booked', 'Treatment Booked', 7, false),
  ('treatment_completed', 'Treatment Completed', 8, false),
  ('post_op_care', 'Post-Operative Care', 9, false),
  ('returned_to_referrer', 'Returned to Referrer', 10, false),
  ('closed', 'Referral Closed', 11, true),
  ('did_not_proceed', 'Did Not Proceed', 12, true),
  ('cancelled', 'Cancelled', 13, true);

insert into treatment_types (name, code, display_order) values
  ('Cataract', 'cataract', 1),
  ('Refractive Lens Exchange', 'rle', 2),
  ('Implantable Contact Lens / ICL', 'icl', 3),
  ('Laser Vision Correction', 'lvc', 4),
  ('Cornea', 'cornea', 5),
  ('Dry Eye', 'dry_eye', 6),
  ('General Ophthalmology', 'general', 7),
  ('Other', 'other', 8);

insert into system_settings (key, value) values
  ('dormancy_thresholds', '{"active_days": 30, "warm_days": 60, "at_risk_days": 90}'::jsonb);
