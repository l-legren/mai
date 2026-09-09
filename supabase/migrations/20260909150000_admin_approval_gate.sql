-- LEG-139: sign-up stays open, but a new user can't touch their own data (expenses, recurring,
-- savings_targets, profile_onboarding) until approved. Approval itself happens via the Supabase
-- dashboard (service role, bypasses RLS) rather than an in-app admin surface — no admin role/flag
-- exists in this schema, deliberately: the dashboard already has full access, so a second,
-- authenticated-role admin path would be unused surface area.

alter table public.profiles
  add column approved boolean not null default false;

-- Reused by every "_own" policy below instead of inlining the same subquery four times per table.
create function public.is_current_user_approved()
returns boolean
language sql
stable
as $$
  select coalesce((select approved from public.profiles where id = (select auth.uid())), false);
$$;

revoke execute on function public.is_current_user_approved() from public;
grant execute on function public.is_current_user_approved() to authenticated;

alter policy "expenses_select_own" on public.expenses
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "expenses_insert_own" on public.expenses
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "expenses_update_own" on public.expenses
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "expenses_delete_own" on public.expenses
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));

alter policy "recurring_select_own" on public.recurring
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "recurring_insert_own" on public.recurring
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "recurring_update_own" on public.recurring
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "recurring_delete_own" on public.recurring
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));

alter policy "savings_targets_select_own" on public.savings_targets
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "savings_targets_insert_own" on public.savings_targets
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "savings_targets_update_own" on public.savings_targets
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "savings_targets_delete_own" on public.savings_targets
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));

alter policy "profile_onboarding_select_own" on public.profile_onboarding
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "profile_onboarding_insert_own" on public.profile_onboarding
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "profile_onboarding_update_own" on public.profile_onboarding
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
alter policy "profile_onboarding_delete_own" on public.profile_onboarding
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id and (select public.is_current_user_approved()));
