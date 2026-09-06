import { cache } from 'react';
import { createSupabaseServerClient } from '../supabase-server';

// cache() dedupes this per request — safe to call again in any Server Component further down.
export const getCurrentUser = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
