/** Proxies to the agent service's POST /ask-mai/remember. Same shape as ../route.ts, no streaming. */

import { z } from 'zod';
import { getAgentServiceUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const RememberBodySchema = z.object({
  content: z.string().min(1),
});

export async function POST(request: Request) {
  const client = await createSupabaseServerClient();
  const {
    data: { session },
  } = await client.auth.getSession();
  if (!session) return Response.json({ error: 'Not signed in' }, { status: 401 });

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = RememberBodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });

  let agentResponse: Response;
  try {
    agentResponse = await fetch(`${getAgentServiceUrl()}/ask-mai/remember`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(parsed.data),
      signal: request.signal,
    });
  } catch (error) {
    console.error('ask-mai remember proxy: could not reach the agent service', error);
    return Response.json({ error: 'Agent service unreachable' }, { status: 502 });
  }

  return new Response(agentResponse.body, {
    status: agentResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
