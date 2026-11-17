-- LEG-179: scoped INSERT for the agent's mcp_write role on public.recurring, so Ask Mai's
-- registerRecurrence tool (agent/src/tools/index.ts, via withScopedWrite) can create a recurring
-- item for the scoped user. Mirrors the mcp_write insert pattern in mai_daily_usage/category_budgets.
--
-- recurring.user_id defaults to auth.uid(), which is null for this role (direct connection, no
-- Supabase JWT), so the insert must set user_id explicitly; the with-check ties it to the
-- per-session app.mcp_user_id GUC and fails closed to zero rows when unset. Insert only — the
-- agent creates recurring items but does not edit or delete them (LEG-178 out of scope).

grant insert on public.recurring to mcp_write;

create policy "mcp_write_insert_scoped" on public.recurring
  for insert to mcp_write
  with check (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
