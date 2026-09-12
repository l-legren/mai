-- LEG-147: category_budgets table + RLS. Monthly per-category spending budgets ("Budget vs
-- actual"), distinct from savings_targets (goal-based saving, not a spending ceiling).

create table public.category_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category text not null,
  -- 'YYYY-MM', matching apps/mobile/src/services/insights.service.ts's monthKey convention.
  period_month text not null check (period_month ~ '^\d{4}-\d{2}$'),
  amount numeric not null check (amount > 0),
  created_at timestamptz not null default now(),
  unique (user_id, category, period_month)
);

create index category_budgets_user_id_idx on public.category_budgets (user_id);

alter table public.category_budgets enable row level security;

create policy "category_budgets_select_own" on public.category_budgets
  for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "category_budgets_insert_own" on public.category_budgets
  for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "category_budgets_update_own" on public.category_budgets
  for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "category_budgets_delete_own" on public.category_budgets
  for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

-- RLS policies only govern which rows are visible; the `authenticated` role also needs the base
-- table grant below, or every query fails with "permission denied for table" regardless of RLS.
grant select, insert, update, delete on public.category_budgets to authenticated;

-- mcp_readonly already gets select on all tables via the default-privileges rule in
-- 20260722110000_mcp_readonly_access.sql; grant repeated here to document intent per table.
grant select on public.category_budgets to mcp_readonly;

create policy "mcp_readonly_select_scoped" on public.category_budgets
  for select to mcp_readonly
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);

-- Unlike mai_memories (insert-only, append-only facts), budgets get re-budgeted in place via
-- upsert on (user_id, category, period_month), so mcp_write needs update as well as insert.
grant insert, update on public.category_budgets to mcp_write;

create policy "mcp_write_insert_scoped" on public.category_budgets
  for insert to mcp_write
  with check (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
create policy "mcp_write_update_scoped" on public.category_budgets
  for update to mcp_write
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid)
  with check (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
