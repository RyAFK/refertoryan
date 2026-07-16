-- CORRECTNESS FIX: is_active_partner() still compared profiles.role to the
-- literal 'partner', a value that no longer exists in the user_role enum
-- after migration 0006 recreated it. Casting a nonexistent enum literal
-- ('partner'::user_role) raises a Postgres error, so this function has
-- been throwing on every call since 0006 - and it gates the
-- patients_insert and referrals_insert RLS policies (0001_init.sql), so
-- every attempted patient/referral insert by a referring-practice user
-- would 500 instead of succeeding or being cleanly denied.
create or replace function public.is_active_partner()
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce(
    (select role = 'referring_user' and status = 'active' from profiles where id = auth.uid()),
    false
  );
$$;

comment on function public.is_active_partner() is
  'Named is_active_partner for historical reasons (predates the 0006 role-matrix migration); checks for an active referring_user, not a literal "partner" enum value.';
