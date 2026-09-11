-- LEG-141: cross-conversation memory for Ask Mai (agent/src/tools.ts's `rememberFact`).

create table public.mai_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- Keep in sync with MAX_MEMORY_CONTENT_LENGTH in agent/src/tools.ts.
  content text not null check (char_length(content) <= 140),
  created_at timestamptz not null default now()
);

create index mai_memories_user_id_idx on public.mai_memories (user_id);

alter table public.mai_memories enable row level security;

-- No `authenticated` policy yet — no UI to view/manage memories (demo scope).

grant select on public.mai_memories to mcp_readonly;

create policy "mcp_readonly_select_scoped" on public.mai_memories
  for select to mcp_readonly
  using (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);

-- mcp_readonly has no write grants by design, so writes get their own role (see roles.sql).
grant connect on database postgres to mcp_write;
grant usage on schema public to mcp_write;
grant insert on public.mai_memories to mcp_write;

create policy "mcp_write_insert_scoped" on public.mai_memories
  for insert to mcp_write
  with check (user_id = nullif((select current_setting('app.mcp_user_id', true)), '')::uuid);
