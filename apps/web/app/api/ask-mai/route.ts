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
import { getAgentIdToken } from '@/lib/gcp-auth';
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

  // Cloud Run's own IAM check consumes the `Authorization` header for the Google ID token below,
  // so the end user's Supabase token (the agent's own auth check) travels in a separate header.
  // Covers getAgentServiceUrl()/getAgentIdToken() throwing (missing env var, WIF failure) — without
  // this, either becomes an unhandled exception that Next.js turns into an opaque 500 with no body.
  let agentServiceUrl: string;
  let idToken: string | null;
  try {
    agentServiceUrl = getAgentServiceUrl();
    idToken = await getAgentIdToken(agentServiceUrl);
  } catch (error) {
    console.error('ask-mai proxy: could not mint Cloud Run ID token', error);
    return Response.json({ error: 'Agent service unreachable' }, { status: 502 });
  }

  let agentResponse: Response;
  try {
    agentResponse = await fetch(`${agentServiceUrl}/ask-mai`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
        'X-Supabase-Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(parsed.data),
      signal: request.signal,
    });
  } catch (error) {
    // Covers the fetch itself failing (agent service down/unreachable) — without this, it becomes
    // an unhandled exception that Next.js turns into an opaque 500 with no body, which
    // `consumeAskMaiStream` then reports as a generic "request failed" with nothing to debug from.
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
