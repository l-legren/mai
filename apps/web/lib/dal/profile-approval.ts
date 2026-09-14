import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import { getCurrentProfileApproval, type ProfileApprovalRow } from '@mai/api';
import { createSupabaseServerClient } from '../supabase-server';
import { getCurrentUser } from './current-user';

export type { ProfileApprovalRow };

// cache() dedupes this per request; unstable_cache persists it across requests/navigations for
// 60s per user. Approval is granted out-of-band (admin action, not through this app), so there's
// no first-party mutation point to call revalidateTag from — the 60s TTL is the only staleness
// bound. That's safe: `approved` only gates this app's redirect/UX, Postgres RLS
// (`is_current_user_approved()`) re-checks live on every actual data query regardless of what this
// cached value says, so a stale "approved: true" can't grant access to anything real.
export const getCurrentApproval = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!user) return getCurrentProfileApproval(supabase);

  return unstable_cache(() => getCurrentProfileApproval(supabase), ['approval', user.id], {
    tags: [`approval:${user.id}`],
    revalidate: 60,
  })();
});
