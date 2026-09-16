-- The row-cap trigger was BEFORE INSERT FOR EACH ROW, so a single bulk upsert (e.g. a 5000-row
-- CSV import) ran its count(*) query once per row — 5000 separate scans in one statement, slow
-- enough to hit Postgres's statement_timeout once the cap was raised from 100 to 5000. Switching
-- to an AFTER INSERT FOR EACH STATEMENT trigger with a transition table runs that count query
-- once per statement (per distinct user_id touched by it) instead of once per row.
--
-- This also happens to be more correct: the transition table only contains rows that were
-- actually inserted, so rows skipped by upsert's ON CONFLICT DO NOTHING (duplicate import_hash)
-- no longer count against the cap the way they did under the old per-candidate-row BEFORE trigger.
--
-- Still enforces atomically: raising inside an AFTER STATEMENT trigger rolls back every row the
-- statement inserted, same as before.
create or replace function public.enforce_expenses_row_cap()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  max_rows constant integer := 5000;
  window_days constant integer := 7;
  touched_user record;
  total_count integer;
begin
  for touched_user in select distinct user_id from new_rows loop
    select count(*) into total_count
      from public.expenses
      where user_id = touched_user.user_id
        and created_at >= now() - (window_days || ' days')::interval;
    if total_count > max_rows then
      raise exception 'expense row limit reached' using errcode = 'MQ001';
    end if;
  end loop;
  return null;
end;
$$;

drop trigger if exists expenses_row_cap on public.expenses;

create trigger expenses_row_cap
  after insert on public.expenses
  referencing new table as new_rows
  for each statement
  execute function public.enforce_expenses_row_cap();

-- The cap query filters on (user_id, created_at); the only existing index is (user_id, spent_on),
-- which doesn't help narrow the created_at range once an account has many rows.
create index expenses_user_id_created_at_idx on public.expenses (user_id, created_at);
