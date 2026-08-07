/**
 * Business layer — avatar upload. Enforces the same limits as the `avatars` bucket (5MB,
 * PNG/JPEG/WebP — see `supabase/migrations/20260807130000_avatars_bucket.sql`) client-side, so the
 * user gets an immediate, friendly error instead of waiting on a rejected upload request.
 */

import { getAvatarSignedUrl, uploadAvatarFile } from '@/data/avatar.data';

/** Matches the `avatars` bucket's `file_size_limit` (5242880 bytes = 5MB). */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

/** Matches the `avatars` bucket's `allowed_mime_types`. */
export const AVATAR_ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'] as const;

export type AvatarUploadErrorCode = 'tooLarge' | 'unsupportedType';

export class AvatarUploadError extends Error {
  code: AvatarUploadErrorCode;

  constructor(code: AvatarUploadErrorCode) {
    super(code);
    this.code = code;
  }
}

function isAllowedType(contentType: string): boolean {
  return (AVATAR_ALLOWED_MIME_TYPES as readonly string[]).includes(contentType);
}

/** Uploads the avatar and returns its storage path (not a browsable URL — the bucket is private). */
export async function uploadAvatar(bytes: ArrayBuffer, contentType: string): Promise<string> {
  if (!isAllowedType(contentType)) throw new AvatarUploadError('unsupportedType');
  if (bytes.byteLength > AVATAR_MAX_BYTES) throw new AvatarUploadError('tooLarge');
  return uploadAvatarFile(bytes, contentType);
}

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function getAvatarUrl(path: string): Promise<string> {
  return getAvatarSignedUrl(path, SIGNED_URL_TTL_SECONDS);
}
