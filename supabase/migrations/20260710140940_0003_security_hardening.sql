-- Fix: set_updated_at had a mutable search_path (advisor: function_search_path_mutable)
create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Fix: notifications/audit_logs INSERT policies were WITH CHECK (true), which
-- is wider than intended — any authenticated caller (not just our own Server
-- Actions) could insert for an arbitrary user via PostgREST. Tighten to match
-- the actual call sites: a user may only write notifications/audit rows about
-- themselves, admins may write on behalf of others (e.g. notifying a partner
-- of a status change).
drop policy if exists notifications_admin_insert on notifications;
create policy notifications_insert on notifications for insert
  with check (user_id = auth.uid() or is_admin());

drop policy if exists audit_insert on audit_logs;
create policy audit_insert on audit_logs for insert
  with check (actor_id = auth.uid() or is_admin());

-- Fix: handle_new_auth_user is a trigger-only function and has no legitimate
-- direct-call use case; revoke it from the exposed API roles. (It still runs
-- fine as a trigger — trigger execution doesn't go through role EXECUTE
-- grants the way a direct RPC call does.)
revoke execute on function handle_new_auth_user() from anon, authenticated;

-- Reduce anon surface on the RLS helper functions. `authenticated` must keep
-- EXECUTE — RLS policies evaluate these functions in the querying user's
-- role, so revoking it here would silently break every policy that uses them.
revoke execute on function is_admin() from anon;
revoke execute on function is_active_partner() from anon;
revoke execute on function has_practice_access(uuid) from anon;
revoke execute on function has_referral_access(uuid) from anon;
revoke execute on function current_profile_role() from anon;
