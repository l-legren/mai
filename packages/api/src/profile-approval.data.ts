/**
 * Data layer — admin-approval gate (`public.profiles.approved`). RLS (`is_current_user_approved()`,
 * used by every other table's `_own` policies) is the actual authorization boundary — this just reads
 * the signed-in user's own state so the app can route them to a "pending approval" screen.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { ProfileApprovalRowSchema, type ProfileApprovalRow } from '@mai/schemas';

import { ApiError } from './api-error';
import { getCurrentUserId } from './auth.data';

export type { ProfileApprovalRow };

const COLUMNS = 'id, email, display_name, approved';

/** The signed-in user's own approval state — used to gate access to the rest of the app. */
export async function getCurrentProfileApproval(
  client: SupabaseClient
): Promise<ProfileApprovalRow> {
  const userId = await getCurrentUserId(client);
  const { data, error } = await client.from('profiles').select(COLUMNS).eq('id', userId).single();
  if (error) throw new ApiError(error.message, error);
  return ProfileApprovalRowSchema.parse(data);
}
