/**
 * Same-origin streaming proxy for the standalone agent service's `/ask-mai` endpoint (see
 * agent/src/server.ts). Authenticates the request server-side via the cookie-based Supabase
 * client, then forwards the UI Message Stream reply straight through — the browser never sees the
 * agent service's URL or a bearer token, and never needs a Supabase client of its own (see
 * CLAUDE.md's "web avoids browser Supabase client" convention).
 *
 * `messages` is only sanity-checked here (non-empty, minimally UIMessage-shaped) — the agent
 * itself does the real validation via `validateUIMessages`, so this doesn't try to duplicate that.
 */

import { z } from 'zod';
import { getAgentServiceUrl } from '@/lib/env';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const AskMaiBodySchema = z.object({
  today: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'today must be YYYY-MM-DD'),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum(['user', 'assistant']),
        parts: z.array(z.record(z.string(), z.unknown())).min(1),
      })
    )
    .min(1),
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

  const parsed = AskMaiBodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: 'Invalid payload' }, { status: 400 });

  let agentResponse: Response;
  try {
    agentResponse = await fetch(`${getAgentServiceUrl()}/ask-mai`, {
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
    // that Next.js turns into an opaque 500 with no body, which `consumeAskMaiStream` then
    // reports as a generic "request failed" with nothing to debug from.
    console.error('ask-mai proxy: could not reach the agent service', error);
    return Response.json({ error: 'Agent service unreachable' }, { status: 502 });
  }

  // Forward the agent's real Content-Type (text/event-stream) rather than hardcoding one — this
  // was already slightly wrong when the wire format was NDJSON, and actively broken for SSE.
  const contentType = agentResponse.headers.get('Content-Type');
  return new Response(agentResponse.body, {
    status: agentResponse.status,
    headers: contentType ? { 'Content-Type': contentType } : undefined,
  });
}
