-- Follow-up to 20260909120000_expenses_import_hash.sql: the partial index there
-- (`where import_hash is not null`) broke the CSV import's upsert with:
--   "there is no unique or exclusion constraint matching the ON CONFLICT specification" (42P10)
-- PostgREST's `upsert(rows, { onConflict: 'user_id,import_hash' })` can only target a full
-- unique index/constraint — it has no way to pass along a WHERE predicate, so it can never match
-- a partial index, no matter how the columns line up.
--
-- Dropping the partial predicate is safe: Postgres treats NULL as distinct from NULL in unique
-- indexes by default, so manually-added expenses (which never set import_hash, leaving it NULL)
-- still never conflict with each other or with imported rows. The partial predicate was only an
-- index-size optimization, never required for correctness — removing it just makes upserts work.
drop index if exists public.expenses_user_id_import_hash_key;

create unique index expenses_user_id_import_hash_key
  on public.expenses (user_id, import_hash);
