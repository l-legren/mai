import 'dotenv/config';
import chalk from 'chalk';
import { Hono, type Context } from 'hono';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { createUIMessageStreamResponse, toUIMessageStream, validateUIMessages } from 'ai';
import { supabase } from './data/supabase.ts';
import { AskMaiRequestMetaSchema, RememberFactRequestSchema } from './types.ts';
import { runAskMai } from './run.ts';
import { saveUserMemory } from './tools/index.ts';

const app = new Hono();

app.use(logger());

type AuthResult = { userId: string } | { error: string };

/** Shared auth check for both routes below. */
async function authenticate(ctx: Context): Promise<AuthResult> {
  const authHeader = ctx.req.header('Authorization');
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
  let result: Awaited<ReturnType<typeof runAskMai>>;
  try {
    result = await runAskMai(auth.userId, messages, metaResult.data.today);
  } catch (error) {
    console.error('ask-mai: runAskMai failed', error);
    return ctx.json({ error: 'Failed to generate a reply' }, 500);
  }

  // rememberFact's tool call (no `execute`, see tools/index.ts) streams out as a native
  // `tool-input-available` part here — no more manual re-encoding into a custom 'confirm' event.
  return createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) });
});

app.post('/ask-mai/remember', async (ctx) => {
  const auth = await authenticate(ctx);
  if ('error' in auth) return ctx.json({ error: auth.error }, 401);

  let jsonBody: unknown;
  try {
    jsonBody = await ctx.req.json();
  } catch {
    return ctx.json({ error: 'Invalid JSON body' }, 400);
  }

  const validationResult = RememberFactRequestSchema.safeParse(jsonBody);
  if (!validationResult.success) return ctx.json({ message: 'Invalid shape of the payload' }, 400);

  try {
    await saveUserMemory(auth.userId, validationResult.data.content);
  } catch (error) {
    console.error('ask-mai remember: saveUserMemory failed', error);
    return ctx.json({ error: 'Failed to save memory' }, 500);
  }

  return ctx.json({ saved: true });
});

const port = Number(process.env.HONO_SERVER_LOCAL_PORT ?? 3060);
const railwayEnv = process.env.RAILWAY_ENVIRONMENT_NAME;

serve({ fetch: app.fetch, port }, () => {
  const location = railwayEnv
    ? chalk.cyan(`Railway (${railwayEnv})`) +
      (process.env.RAILWAY_PUBLIC_DOMAIN ? ` — https://${process.env.RAILWAY_PUBLIC_DOMAIN}` : '')
    : chalk.yellow(`local — http://localhost:${port}`);
  console.log(`${chalk.green('✓')} mai agent server running on ${location}`);
});
