-- LEG-159: the ON CONFLICT DO UPDATE in addDailyTokensUsed reads the existing tokens_used value
-- (mai_daily_usage.tokens_used + excluded.tokens_used), which needs SELECT, not just UPDATE.

grant select on public.mai_daily_usage to mcp_write;

create policy "mcp_write_select_scoped" on public.mai_daily_usage
  for select to mcp_write
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
