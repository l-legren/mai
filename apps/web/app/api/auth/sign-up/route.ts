import { NextResponse } from 'next/server';
import { AuthError, signUp } from '@moniq/auth';
import { authErrorStatus } from '@/lib/auth-error-status';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const body = await request.json();
  const name = String(body?.name ?? '');
  const email = String(body?.email ?? '');
  const password = String(body?.password ?? '');

  const client = await createSupabaseServerClient();

  try {
    // `null` means the account needs email confirmation before it can sign in — not an error.
    const user = await signUp(client, name, email, password);
    return NextResponse.json({ user });
  } catch (err) {
    const code = err instanceof AuthError ? err.code : 'unknown';
    return NextResponse.json({ code }, { status: authErrorStatus(code) });
  }
}
