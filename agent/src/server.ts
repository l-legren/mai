import 'dotenv/config';
import chalk from 'chalk';
import { Hono, type Context } from 'hono';
import { stream } from 'hono/streaming';
import { serve } from '@hono/node-server';
import { supabase } from './data/supabase.ts';
import { AskMaiRequestSchema, RememberFactRequestSchema } from './types.ts';
import { runAskMai } from './run.ts';
import { saveUserMemory } from './tools/index.ts';

const app = new Hono();

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

  const validationResult = AskMaiRequestSchema.safeParse(jsonBody);
  if (!validationResult.success) return ctx.json({ message: 'Invalid shape of the payload' }, 400);

  const result = await runAskMai(
    auth.userId,
    validationResult.data.messages,
    validationResult.data.today
  );
  ctx.header('Content-Type', 'application/json');

  return stream(ctx, async (s) => {
    try {
      for await (const part of result.stream) {
        if (part.type === 'text-delta') {
          await s.writeln(JSON.stringify({ type: 'text', text: part.text }));
        } else if (part.type === 'tool-call') {
          // rememberFact is a pending proposal, not a run tool — its own event, not 'tool'.
          if (part.toolName === 'rememberFact') {
            const { content } = part.input as { content: string };
            await s.writeln(JSON.stringify({ type: 'confirm', content }));
          } else {
            await s.writeln(JSON.stringify({ type: 'tool', toolName: part.toolName }));
          }
        } else if (part.type === 'error') {
          await s.writeln(JSON.stringify({ type: 'error' }));
        }
      }
    } catch (e) {
      console.error(`Error during stream call: ${e}`);
      throw new Error('An error occured during the stream');
    }
  });
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

  await saveUserMemory(auth.userId, validationResult.data.content);
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
