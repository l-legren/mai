-- LEG-165: global daily token cap for Ask Mai, on top of the existing per-user cap
-- (agent/src/context/modelLimits.ts). mcp_readonly's existing SELECT policy on mai_daily_usage is
-- scoped to one user (app.mcp_user_id) — a security definer function is used here instead of
-- widening that policy, so mcp_readonly still can't read other users' individual usage rows.

create or replace function public.mai_global_daily_tokens_used()
returns integer
language sql
security definer
set search_path = public
as $$
  select coalesce(sum(tokens_used), 0)::integer
  from public.mai_daily_usage
  where usage_date = current_date;
$$;

grant execute on function public.mai_global_daily_tokens_used() to mcp_readonly;
