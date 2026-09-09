-- This is a public demo — anyone can sign up and write to `expenses` without limit (manually, or
-- via the bulk CSV import). An app-level check is trivially bypassed by calling PostgREST directly
-- with a valid JWT, so the cap has to live where every write actually goes through: the table
-- itself. A BEFORE INSERT FOR EACH ROW trigger sees rows already inserted earlier in the same
-- multi-row statement (Postgres advances the command counter between rows), so a bulk CSV import
-- that would cross the cap fails the whole statement atomically instead of partially importing.
--
-- Rate-limited per rolling 7-day window rather than a lifetime total, so a genuine long-running demo
-- user never hits a permanent wall — only bursts (a big CSV import, a scripted flood) are capped.
-- Keyed off `created_at` (real insertion time), NOT `spent_on`/`spent_at` — those are user-supplied
-- from the bank CSV's own date column, so an attacker could otherwise dodge the window entirely by
-- uploading rows dated across many different weeks while inserting them all in one burst today.
create or replace function public.enforce_expenses_row_cap()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  max_rows constant integer := 100;
  window_days constant integer := 7;
  current_count integer;
begin
  select count(*) into current_count
    from public.expenses
    where user_id = new.user_id
      and created_at >= now() - (window_days || ' days')::interval;
  if current_count >= max_rows then
    raise exception 'expense row limit reached' using errcode = 'MQ001';
  end if;
  return new;
end;
$$;

create trigger expenses_row_cap
  before insert on public.expenses
  for each row
  execute function public.enforce_expenses_row_cap();
