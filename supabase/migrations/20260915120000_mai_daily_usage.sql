-- LEG-158: per-user daily token quota for Ask Mai (agent/src/context/modelLimits.ts).

create table public.mai_daily_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  -- Server date, not the client-supplied `today` — prevents a client resetting its own quota.
  usage_date date not null default current_date,
  tokens_used integer not null default 0,
  primary key (user_id, usage_date)
);

alter table public.mai_daily_usage enable row level security;

grant select on public.mai_daily_usage to mcp_readonly;

create policy "mcp_readonly_select_scoped" on public.mai_daily_usage
  for select to mcp_readonly
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);

grant insert, update on public.mai_daily_usage to mcp_write;

create policy "mcp_write_insert_scoped" on public.mai_daily_usage
  for insert to mcp_write
  with check (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);

create policy "mcp_write_update_scoped" on public.mai_daily_usage
  for update to mcp_write
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
