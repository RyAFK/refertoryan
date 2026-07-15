-- organisations had RLS enabled but no policies (deny-all), flagged by the
-- security linter as an oversight rather than an intentional lockdown.
create policy organisations_select on public.organisations for select
  using (
    is_ecl_staff()
    or exists (
      select 1 from public.practices pr
      where pr.organisation_id = organisations.id
        and public.has_practice_access(pr.id)
    )
  );

create policy organisations_admin_write on public.organisations for insert
  with check (is_admin());
create policy organisations_admin_update on public.organisations for update
  using (is_admin())
  with check (is_admin());
