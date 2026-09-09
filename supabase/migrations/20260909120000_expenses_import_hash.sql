-- LEG-137: bank CSV import dedups re-uploaded/overlapping statements by hashing
-- (date, amount, description) client-side; upserting with this unique index as the
-- conflict target (ON CONFLICT DO NOTHING) lets a re-upload skip rows it already
-- imported instead of erroring.
alter table public.expenses add column import_hash text;

create unique index expenses_user_id_import_hash_key
  on public.expenses (user_id, import_hash)
  where import_hash is not null;
