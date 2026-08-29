/**
 * Data layer — avatar image storage (private `avatars` Supabase Storage bucket, LEG-99/100).
 * Raw upload/signed-URL operations only.
 */

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';
import { getSupabaseClient } from './supabase-client';

const AVATAR_OBJECT_NAME = 'avatar';

/** Uploads (or overwrites) the signed-in user's single avatar file. Returns its storage path. */
export async function uploadAvatarFile(bytes: ArrayBuffer, contentType: string): Promise<string> {
  const userId = await getCurrentUserId();
  const path = `${userId}/${AVATAR_OBJECT_NAME}`;
  const { error } = await getSupabaseClient()
    .storage.from('avatars')
    .upload(path, bytes, { contentType, upsert: true });
  if (error) throw new ApiError(error.message, error);
  return path;
}

/** The bucket is private, so display always goes through a time-limited signed URL. */
export async function getAvatarSignedUrl(path: string, expiresInSeconds: number): Promise<string> {
  const { data, error } = await getSupabaseClient()
    .storage.from('avatars')
    .createSignedUrl(path, expiresInSeconds);
  if (error) throw new ApiError(error.message, error);
  return data.signedUrl;
}
