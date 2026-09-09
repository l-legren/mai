-- LEG-99: onboarding profile data. A separate table from `profiles` (rather than new columns on it)
-- because `profiles` already gets a row auto-created by `handle_new_user` at signup — adding required
-- fields there would force either NULL or a fake default the moment the column is added. Here, no row
-- exists until onboarding completes with one atomic insert, so every field but `avatar_url` can be
-- genuinely NOT NULL. Row existence for a user *is* "onboarding completed" — no separate flag needed.

create table public.profile_onboarding (
  user_id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  surname text not null,
  city text not null,
  currency text not null,
  avatar_url text,
  notifications_enabled boolean not null default false,
  completed_at timestamptz not null default now()
);

alter table public.profile_onboarding enable row level security;

create policy "profile_onboarding_select_own" on public.profile_onboarding
  for select using (auth.uid() is not null and auth.uid() = user_id);
create policy "profile_onboarding_insert_own" on public.profile_onboarding
  for insert with check (auth.uid() is not null and auth.uid() = user_id);
create policy "profile_onboarding_update_own" on public.profile_onboarding
  for update using (auth.uid() is not null and auth.uid() = user_id);
create policy "profile_onboarding_delete_own" on public.profile_onboarding
  for delete using (auth.uid() is not null and auth.uid() = user_id);

-- RLS policies only govern which rows are visible; the `authenticated` role also needs the base
-- table grant below, or every query fails with "permission denied for table" regardless of RLS.
grant select, insert, update, delete on public.profile_onboarding to authenticated;
