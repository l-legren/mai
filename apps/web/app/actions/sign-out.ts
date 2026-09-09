'use server';

import { redirect } from 'next/navigation';
import { signOutUser } from '@mai/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// No /sign-out page — nothing for a page you land on after leaving to say.
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await signOutUser(supabase);
  redirect('/welcome');
}
