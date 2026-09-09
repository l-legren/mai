-- LEG-109: follow-up to 20260818090000. `revoke ... from public` there had no effect — Supabase's
-- own bootstrap grants EXECUTE directly to `anon`/`authenticated`/`service_role` on every new
-- function (via `alter default privileges`), not through the `PUBLIC` pseudo-role, so revoking from
-- PUBLIC never touched the actual grants. Revoke from the real grantees instead.

revoke execute on function public.delete_own_account() from anon;
revoke execute on function public.handle_new_user() from anon, authenticated;
