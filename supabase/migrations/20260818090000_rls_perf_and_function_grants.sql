-- LEG-109: fixes from the hosted-project Supabase advisor run.
--
-- 1) auth_rls_initplan (perf): every policy called `auth.uid()` / `current_setting()` bare in its
--    USING/WITH CHECK clause, so Postgres re-evaluates it per row instead of once per statement.
--    Wrapping the call in `(select ...)` lets the planner treat it as a stable InitPlan.
-- 2) multiple_permissive_policies (perf): the owner "select own" policies didn't scope `to
--    authenticated`, so they also applied to `mcp_readonly`, stacking with
--    `mcp_readonly_select_scoped` on every query from that role. Scoping them closes the overlap.
-- 3) anon_security_definer_function_executable / authenticated_security_definer_function_executable
--    (security): both SECURITY DEFINER functions had implicit PUBLIC execute (Postgres' default
--    grant on new functions), on top of the explicit `authenticated` grant already given to
--    `delete_own_account`. `handle_new_user` is trigger-only (`returns trigger`) and was never
--    meant to be called directly — revoking PUBLIC removes the dead RPC surface for both.

revoke execute on function public.delete_own_account() from public;
revoke execute on function public.handle_new_user() from public;

alter policy "profiles_select_own" on public.profiles
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);
alter policy "profiles_insert_own" on public.profiles
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = id);
alter policy "profiles_update_own" on public.profiles
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);
alter policy "profiles_delete_own" on public.profiles
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = id);

alter policy "expenses_select_own" on public.expenses
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "expenses_insert_own" on public.expenses
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "expenses_update_own" on public.expenses
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "expenses_delete_own" on public.expenses
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

alter policy "recurring_select_own" on public.recurring
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "recurring_insert_own" on public.recurring
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "recurring_update_own" on public.recurring
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "recurring_delete_own" on public.recurring
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

alter policy "savings_targets_select_own" on public.savings_targets
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "savings_targets_insert_own" on public.savings_targets
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "savings_targets_update_own" on public.savings_targets
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "savings_targets_delete_own" on public.savings_targets
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

alter policy "profile_onboarding_select_own" on public.profile_onboarding
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "profile_onboarding_insert_own" on public.profile_onboarding
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "profile_onboarding_update_own" on public.profile_onboarding
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
alter policy "profile_onboarding_delete_own" on public.profile_onboarding
  to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

alter policy "mcp_readonly_select_scoped" on public.profiles
  using (id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
alter policy "mcp_readonly_select_scoped" on public.expenses
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
alter policy "mcp_readonly_select_scoped" on public.recurring
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
alter policy "mcp_readonly_select_scoped" on public.savings_targets
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);

alter policy "avatars_select_own" on storage.objects
  to authenticated
  using (
    bucket_id = 'avatars' and (select auth.uid()) is not null
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
alter policy "avatars_insert_own" on storage.objects
  to authenticated
  with check (
    bucket_id = 'avatars' and (select auth.uid()) is not null
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
alter policy "avatars_update_own" on storage.objects
  to authenticated
  using (
    bucket_id = 'avatars' and (select auth.uid()) is not null
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
alter policy "avatars_delete_own" on storage.objects
  to authenticated
  using (
    bucket_id = 'avatars' and (select auth.uid()) is not null
    and (select auth.uid())::text = (storage.foldername(name))[1]
  );
