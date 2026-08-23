// Edge Function — thin HTTP adapter over the `agent` package's `runAskMoniq`, which holds the
// actual prompt/tool/model logic so it stays runnable (and testable/extractable) outside Deno too.
// Holds the Anthropic API key and the `mcp_readonly` Postgres connection string server-side; the
// mobile app never sees either.
//
// The caller's user id always comes from the verified Supabase JWT on the request, never from the
// request body — this is what lets `runAskMoniq`'s tools read only that user's data.
//
// Local dev:  supabase functions serve --env-file supabase/functions/.env.local
// Hosted:     supabase secrets set ANTHROPIC_API_KEY=sk-ant-... MCP_READONLY_DATABASE_URL=...
//
// @ts-nocheck -- Deno globals (`Deno.serve`, `Deno.env`) aren't known to the app's Node-oriented
// tsconfig; this file is type-checked by `deno check` / the Supabase CLI at deploy time instead.

import { createClient } from '@supabase/supabase-js';

import { runAskMoniq } from '../../../agent/src/run.ts';
import { AskMoniqRequestSchema } from '../../../agent/src/types.ts';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'Missing authorization' }), { status: 401 });
  }

  const supabase = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'), {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const parsed = AskMoniqRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid ask-moniq payload' }), { status: 400 });
  }

  // Newline-delimited JSON body: `{"type":"text","text":"..."}` per token delta and
  // `{"type":"tool","toolName":"..."}` per tool call, so the app can render the reply as it
  // arrives instead of waiting for the full (possibly tool-calling) turn to finish. A custom
  // protocol rather than the AI SDK's own UI-message-stream format, since that's designed for
  // `ai/react`'s `useChat` on the web — React Native reads this with a plain fetch + reader.
  const result = runAskMoniq(user.id, parsed.data.messages, parsed.data.today);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === 'text-delta') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'text', text: part.text }) + '\n')
            );
          } else if (part.type === 'tool-call') {
            controller.enqueue(
              encoder.encode(JSON.stringify({ type: 'tool', toolName: part.toolName }) + '\n')
            );
          } else if (part.type === 'error') {
            console.error('ask-moniq: stream part error', part.error);
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'error' }) + '\n'));
          }
        }
      } catch (error) {
        console.error('ask-moniq: agent loop failed mid-stream', error);
        controller.enqueue(encoder.encode(JSON.stringify({ type: 'error' }) + '\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { 'Content-Type': 'application/x-ndjson' } });
});
