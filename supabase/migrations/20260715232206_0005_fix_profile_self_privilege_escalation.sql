-- SECURITY FIX: profiles_update_own_limited only restricted which ROWS a
-- user can update (their own), not which COLUMNS. A regular user could
-- therefore PATCH their own profile row and set role/status/mfa_required
-- directly, self-granting admin access. Block that with a row-level trigger
-- that only an ECL system administrator can bypass.

create or replace function public.prevent_self_privilege_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Only an ECL system administrator can change a user''s role';
    end if;
    if new.status is distinct from old.status then
      raise exception 'Only an ECL system administrator can change a user''s account status';
    end if;
    if new.mfa_required is distinct from old.mfa_required then
      raise exception 'Only an ECL system administrator can change MFA requirements';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_self_privilege_escalation on public.profiles;
create trigger trg_prevent_self_privilege_escalation
before update on public.profiles
for each row execute function public.prevent_self_privilege_escalation();

comment on function public.prevent_self_privilege_escalation() is
  'Blocks non-admin updates to profiles.role/status/mfa_required, closing a self-privilege-escalation gap in profiles_update_own_limited.';
