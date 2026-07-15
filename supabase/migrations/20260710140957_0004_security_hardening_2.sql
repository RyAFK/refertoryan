-- The previous revoke targeted anon/authenticated directly, but Postgres
-- grants EXECUTE to the PUBLIC pseudo-role by default on function creation,
-- and anon/authenticated inherit through PUBLIC regardless of a direct
-- per-role revoke. Revoke from PUBLIC explicitly, then re-grant only what's
-- actually needed: `authenticated` must keep the four helper functions
-- because RLS policies evaluate them as the querying role.

revoke execute on function handle_new_auth_user() from public;
revoke execute on function current_profile_role() from public;
revoke execute on function is_admin() from public;
revoke execute on function is_active_partner() from public;
revoke execute on function has_practice_access(uuid) from public;
revoke execute on function has_referral_access(uuid) from public;

grant execute on function is_admin() to authenticated;
grant execute on function is_active_partner() to authenticated;
grant execute on function has_practice_access(uuid) to authenticated;
grant execute on function has_referral_access(uuid) to authenticated;
grant execute on function current_profile_role() to authenticated;
-- handle_new_auth_user intentionally has no direct grants — trigger-only.
