// Edge Function — generates a short natural-language spending summary via Claude Haiku 4.5.
// Holds the Anthropic API key server-side; the mobile app never sees it.
//
// Runs on Supabase's Deno-based edge runtime. The `npm:` specifier tells Deno to fetch and cache
// this npm package directly — no package.json, no node_modules, no manual install step.
//
// Local dev:  supabase secrets set --env-file supabase/functions/.env.local ANTHROPIC_API_KEY=sk-ant-...
// Hosted:     supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
//
// @ts-nocheck -- Deno globals (`Deno.serve`, `Deno.env`) aren't known to the app's Node-oriented
// tsconfig; this file is type-checked by `deno check` / the Supabase CLI at deploy time instead.

import Anthropic from 'npm:@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') });

type CategoryTotalPayload = { category: string; amount: number };

type SpendingSummaryPayload = {
  periodLabel: string;
  spent: number;
  saved: number;
  goal: number;
  onTrack: boolean;
  breakdown: CategoryTotalPayload[];
};

const SYSTEM_PROMPT =
  'You are a concise personal finance assistant inside a budgeting app. Write a 2-3 sentence ' +
  'spending summary for the user from the JSON data provided. Use only the numbers given — ' +
  'never invent figures. Refer to amounts with the € symbol. Do not use markdown formatting.';

function isSpendingSummaryPayload(value: unknown): value is SpendingSummaryPayload {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.periodLabel === 'string' &&
    typeof v.spent === 'number' &&
    typeof v.saved === 'number' &&
    typeof v.goal === 'number' &&
    typeof v.onTrack === 'boolean' &&
    Array.isArray(v.breakdown)
  );
}

Deno.serve(async (req) => {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400 });
  }

  if (!isSpendingSummaryPayload(payload)) {
    return new Response(JSON.stringify({ error: 'Invalid spending summary payload' }), {
      status: 400,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: JSON.stringify(payload) }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('generate-spending-summary: Claude call failed', error);
    return new Response(JSON.stringify({ error: 'Failed to generate summary' }), { status: 502 });
  }
});
