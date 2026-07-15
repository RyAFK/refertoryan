-- Introduces an Organisation model (so ECL itself is a first-class org, not
-- an implicit concept) and expands the flat 3-value user_role enum into the
-- ECL-side role matrix from the architecture spec. All tables touched here
-- currently have 0 rows in this project, so this is a structural migration,
-- not a data migration.

create type public.organisation_type as enum ('ecl', 'referring_practice', 'service_provider');

create table public.organisations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type public.organisation_type not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references public.profiles(id)
);

alter table public.organisations enable row level security;

create trigger set_organisations_updated_at
before update on public.organisations
for each row execute function public.set_updated_at();

insert into public.organisations (name, type)
values ('Eye Clinic London', 'ecl');

alter table public.practices
  add column organisation_id uuid references public.organisations(id);

alter table public.profiles
  add column organisation_id uuid references public.organisations(id);

-- --- Expand user_role from {partner, admin, super_admin} to the ECL role
-- matrix.
alter table public.profiles alter column role drop default;
alter table public.profiles alter column role type text using role::text;
drop function if exists public.current_profile_role();
drop type public.user_role;

create type public.user_role as enum (
  'ecl_system_admin',
  'ecl_clinical_user',
  'ecl_referral_coordinator',
  'ecl_read_only_auditor',
  'referring_user'
);

update public.profiles set role = case role
  when 'admin' then 'ecl_system_admin'
  when 'super_admin' then 'ecl_system_admin'
  when 'partner' then 'referring_user'
  else 'referring_user'
end;

alter table public.profiles alter column role type public.user_role using role::public.user_role;
alter table public.profiles alter column role set default 'referring_user'::public.user_role;

update public.profiles set organisation_id = (select id from public.organisations where type = 'ecl')
where role in ('ecl_system_admin', 'ecl_clinical_user', 'ecl_referral_coordinator', 'ecl_read_only_auditor');

create or replace function public.current_profile_role()
returns public.user_role
language sql stable security definer set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role = 'ecl_system_admin' and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_ecl_staff()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role in ('ecl_system_admin', 'ecl_clinical_user', 'ecl_referral_coordinator', 'ecl_read_only_auditor')
       and status = 'active'
     from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_clinical_user()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role = 'ecl_clinical_user' and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_read_only_auditor()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role = 'ecl_read_only_auditor' and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.has_practice_access(target_practice_id uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from practice_memberships pm
    join profiles p on p.id = pm.profile_id
    where pm.practice_id = target_practice_id
      and pm.profile_id = auth.uid()
      and pm.is_active = true
      and p.status = 'active'
  ) or is_ecl_staff();
$$;

drop policy if exists patients_select on public.patients;
create policy patients_select on public.patients for select
  using (is_ecl_staff() or exists (
    select 1 from referrals r where r.patient_id = patients.id and has_practice_access(r.practice_id)
  ));

drop policy if exists audit_admin_only on public.audit_logs;
create policy audit_admin_only on public.audit_logs for select
  using (is_admin() or is_read_only_auditor());

drop policy if exists referrals_admin_update on public.referrals;
create policy referrals_admin_update on public.referrals for update
  using (is_ecl_staff())
  with check (is_ecl_staff());

comment on column public.practices.organisation_id is
  'Nullable until Stage 3 backfill creates/attaches a referring_practice organisation per existing practice.';
comment on function public.has_practice_access(uuid) is
  'Practice-scoped access for a practice member, or any active ECL staff member (broad read per role matrix).';
