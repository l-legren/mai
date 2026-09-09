import { cache } from 'react';
import { getCurrentProfileApproval, type ProfileApprovalRow } from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';

export type { ProfileApprovalRow };

// cache() dedupes this per request — safe to call again in any Server Component further down.
export const getCurrentApproval = cache(async () => {
  const supabase = await createSupabaseServerClient();
  return getCurrentProfileApproval(supabase);
});
