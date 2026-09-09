-- LEG-60: cluster-level roles. Applied by the Supabase CLI before migrations on every
-- `supabase start` / `supabase db reset` — unlike tables, roles aren't dropped when the
-- database is recreated, so this must be idempotent or a second reset fails on "role exists".
--
-- LOCAL DEV ONLY: this is a placeholder password for the local container. Never reuse it, and
-- never point this role at a real/hosted project without rotating the password first.
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'mcp_readonly') then
    create role mcp_readonly login password 'mcp_readonly_local_dev_only';
  end if;
end
$$;

-- LEG-141: write counterpart to mcp_readonly, for tools that need to write (e.g. rememberFact).
do $$
begin
  if not exists (select from pg_catalog.pg_roles where rolname = 'mcp_write') then
    create role mcp_write login password 'mcp_write_local_dev_only';
  end if;
end
$$;
