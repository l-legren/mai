import 'dotenv/config';
import chalk from 'chalk';
import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  validateUIMessages,
} from 'ai';
import { supabase } from './data/supabase.ts';
import { AskMaiRequestMetaSchema } from './types.ts';
import { runAskMai } from './run.ts';

const app = new Hono();

app.use(logger());

type AuthResult = { userId: string } | { error: string };

/** Shared auth check for both routes below. `X-Supabase-Authorization`, not `Authorization` — the
 * latter is consumed by Cloud Run's own IAM check (Google ID token) before the request reaches here. */
async function authenticate(ctx: Context): Promise<AuthResult> {
  const authHeader = ctx.req.header('X-Supabase-Authorization');
  if (!authHeader) return { error: 'Missing authentication' };

  const { data, error } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
  if (!data.user) return { error: `Unauthorized error: ${error}` };

  return { userId: data.user.id };
}

app.post('/ask-mai', async (ctx) => {
  const auth = await authenticate(ctx);
  if ('error' in auth) return ctx.json({ error: auth.error }, 401);

  let jsonBody: unknown;
  try {
    jsonBody = await ctx.req.json();
  } catch {
    return ctx.json({ error: 'Invalid JSON body' }, 400);
  }

  const metaResult = AskMaiRequestMetaSchema.safeParse(jsonBody);
  if (!metaResult.success) return ctx.json({ message: 'Invalid shape of the payload' }, 400);

  // No `tools` option here — generic tool call input/output is only validated against a schema
  // if one's provided, and the loop itself is what actually runs/rejects tool calls, not this.
  let messages;
  try {
    messages = await validateUIMessages({
      messages: (jsonBody as { messages?: unknown }).messages,
    });
  } catch {
    return ctx.json({ message: 'Invalid shape of the payload' }, 400);
  }

  // Awaits the memories DB read (see run.ts) before any streaming starts, so a failure there
  // (or a model-setup error) is still a normal exception at this point, not a stream error —
  // caught here so it reaches the client as a real error instead of an opaque connection drop.
  let runResult: Awaited<ReturnType<typeof runAskMai>>;
  try {
    runResult = await runAskMai(auth.userId, messages, metaResult.data.today);
  } catch (error) {
    console.error('ask-mai: runAskMai failed', error);
    return ctx.json({ error: 'Failed to generate a reply' }, 500);
  }

  // Delivered as a normal assistant turn (a `data-quotaExceeded` part, no text) rather than an
  // HTTP error, so the client renders it through the same message-list UI as any other reply —
  // see apps/web/app/(app)/ask/AskChatView.tsx and apps/mobile/src/hooks/ask-turns.ts.
  if (runResult.type === 'blocked') {
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        writer.write({ type: 'data-quotaExceeded', data: {} });
      },
    });
    return createUIMessageStreamResponse({ stream });
  }

  // rememberFact (tools/index.ts) saves immediately via its own execute — no separate confirm route.
  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: runResult.result.stream }),
  });
});

/** K_SERVICE is set automatically by Cloud Run — unset locally, so it falls through to local-dev. */
function resolveServerLocation(port: number): string {
  const cloudRunService = process.env.K_SERVICE;
  if (cloudRunService) return chalk.cyan(`Cloud Run (${cloudRunService})`);

  return chalk.yellow(`local — http://localhost:${port}`);
}

const port = Number(process.env.PORT ?? process.env.HONO_SERVER_LOCAL_PORT ?? 3060);

serve({ fetch: app.fetch, port }, () => {
  console.log(`${chalk.green('✓')} mai agent server running on ${resolveServerLocation(port)}`);
});
