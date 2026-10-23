import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    try {
      const client = await createSupabaseServerClient();
      const { error } = await client.auth.exchangeCodeForSession(code);
      if (error) {
        console.error('auth callback: exchangeCodeForSession rejected', error.message);
        return Response.redirect(`${origin}/sign-in`);
      }
    } catch (err) {
      console.error('auth callback: exchangeCodeForSession threw', err);
      return Response.redirect(`${origin}/sign-in`);
    }
  }

  return Response.redirect(origin);
}
