/**
 * Same-origin streaming proxy for the standalone agent service's `/ask-moniq` endpoint (see
 * agent/src/server.ts). Authenticates the request server-side via the cookie-based Supabase
 * client, then forwards the NDJSON reply stream straight through — the browser never sees the
 * agent service's URL or a bearer token, and never needs a Supabase client of its own (see
 * CLAUDE.md's "web avoids browser Supabase client" convention).
 */

import { z } from 'zod';
import { getAgentServiceUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const AskMoniqBodySchema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
  messages: z.array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() })).min(1),
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

  const parsed = AskMoniqBodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });

  let agentResponse: Response;
  try {
    agentResponse = await fetch(`${getAgentServiceUrl()}/ask-moniq`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(parsed.data),
      signal: request.signal,
    });
  } catch (error) {
    // Covers both `getAgentServiceUrl()` throwing (missing env var) and the fetch itself failing
    // (agent service down/unreachable) — without this, either one becomes an unhandled exception
    // that Next.js turns into an opaque 500 with no body, which `consumeAskMoniqStream` then
    // reports as a generic "request failed" with nothing to debug from.
    console.error('ask-moniq proxy: could not reach the agent service', error);
    return Response.json({ error: 'Agent service unreachable' }, { status: 502 });
  }

  return new Response(agentResponse.body, {
    status: agentResponse.status,
    headers: { 'Content-Type': 'application/json' },
  });
}
