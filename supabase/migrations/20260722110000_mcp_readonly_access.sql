-- LEG-60: read-only access for the MCP tool's `mcp_readonly` role (see supabase/roles.sql).
--
-- Deliberately NOT bypassrls: the role connects directly (no Supabase JWT, so auth.uid() is null
-- and the existing "select own" policies contribute nothing for it), so instead each table gets a
-- second permissive select policy scoped to whichever user the caller names via a per-session GUC.
-- Postgres ORs multiple permissive policies together, so this only ever *adds* visibility for
-- mcp_readonly — it does not change what `authenticated` can see.
--
-- Callers must run `set local app.mcp_user_id = '<uuid>'` before querying. No session var set (or
-- an empty one) means the cast below yields null, and null = user_id is never true — it fails
-- closed to zero rows, not open to everything.

grant connect on database postgres to mcp_readonly;
grant usage on schema public to mcp_readonly;
grant select on all tables in schema public to mcp_readonly;
alter default privileges in schema public grant select on tables to mcp_readonly;

create policy "mcp_readonly_select_scoped" on public.profiles
  for select to mcp_readonly
  using (id = nullif(current_setting('app.mcp_user_id', true), '')::uuid);

create policy "mcp_readonly_select_scoped" on public.expenses
  for select to mcp_readonly
  using (user_id = nullif(current_setting('app.mcp_user_id', true), '')::uuid);

create policy "mcp_readonly_select_scoped" on public.recurring
  for select to mcp_readonly
  using (user_id = nullif(current_setting('app.mcp_user_id', true), '')::uuid);

create policy "mcp_readonly_select_scoped" on public.savings_targets
  for select to mcp_readonly
  using (user_id = nullif(current_setting('app.mcp_user_id', true), '')::uuid);
