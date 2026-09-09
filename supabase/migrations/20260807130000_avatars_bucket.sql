-- LEG-99: private avatars bucket for onboarding/profile photos. Objects are stored as
-- `<user_id>/<filename>` and RLS restricts access to the owning user, same posture as every other
-- table in this app. Native Storage `allowed_mime_types`/`file_size_limit` cover MVP upload
-- validation (rejected at the Storage API level) — deeper checks (real image-content sniffing,
-- EXIF stripping) would be a Supabase Edge Function hook later, not a separate backend, if ever needed.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', false, 5242880, array['image/png', 'image/jpeg', 'image/webp']);

create policy "avatars_select_own" on storage.objects
  for select using (
    bucket_id = 'avatars' and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_update_own" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "avatars_delete_own" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid() is not null
    and auth.uid()::text = (storage.foldername(name))[1]
  );
