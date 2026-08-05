// Edge Function — thin HTTP adapter over the `agent` package's `runWeeklyAnalysis`, which holds
// the actual prompt/model logic so it stays runnable (and testable/extractable) outside Deno too.
// Holds the Anthropic API key server-side; the mobile app never sees it.
//
// Local dev:  supabase secrets set --env-file supabase/functions/.env.local ANTHROPIC_API_KEY=sk-ant-...
// Hosted:     supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// @ts-nocheck -- Deno globals (`Deno.serve`) aren't known to the app's Node-oriented tsconfig;
// this file is type-checked by `deno check` / the Supabase CLI at deploy time instead.

import { runWeeklyAnalysis } from '../../../agent/src/run.ts';
import { SpendingSummaryInputSchema } from '../../../agent/src/types.ts';

Deno.serve(async (req) => {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  const parsed = SpendingSummaryInputSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Invalid spending summary payload' }), {
      status: 400,
    });
  }

  try {
    const text = await runWeeklyAnalysis(parsed.data);
    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-spending-summary: Claude call failed', error);
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), { status: 502 });
  }
});
