import { NextResponse } from 'next/server';
import { AuthError, signIn } from '@moniq/auth';
import { authErrorStatus } from '@/lib/auth-error-status';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body?.email ?? '');
  const password = String(body?.password ?? '');

  const client = await createSupabaseServerClient();

  try {
    const user = await signIn(client, email, password);
    return NextResponse.json({ user });
  } catch (err) {
    const code = err instanceof AuthError ? err.code : 'unknown';
    return NextResponse.json({ code }, { status: authErrorStatus(code) });
  }
}
