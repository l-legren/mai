-- Raises the per-user rolling-window expense cap from 100 to 5000. Access to the app is now also
-- gated behind admin approval (see 20260909150000_admin_approval_gate.sql), so the original
-- "anyone can sign up" abuse case this trigger guarded against no longer applies to the same
-- degree — this just keeps a ceiling on approved users' bulk imports (e.g. multi-year bank CSVs)
-- rather than removing the cap outright.
create or replace function public.enforce_expenses_row_cap()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  max_rows constant integer := 5000;
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
