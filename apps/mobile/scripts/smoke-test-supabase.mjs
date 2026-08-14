#!/usr/bin/env node
/**
 * Round-trips every Supabase-backed resource against the real local container: insert, read,
 * update, delete, cleaning up after itself. Mocked unit tests can't catch wrong column names,
 * missing RLS policies, or missing table grants — this can (it already has, twice).
 *
 * Requires `supabase start` running locally. Signs in as the seeded dev user (see supabase/seed.sql).
 *
 * Usage: pnpm smoke
 */

import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';

/** Minimal .env loader — avoids depending on @expo/env, which isn't a direct dependency. */
function loadDotEnv(path) {
  let contents;
  try {
    contents = readFileSync(path, 'utf8');
  } catch {
    return;
  }
  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, key, rawValue = ''] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

loadDotEnv(new URL('../.env', import.meta.url));

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const DEV_EMAIL = 'dev@moniq.app';
const DEV_PASSWORD = 'password123';

function fail(step, error) {
  console.error(`✘ ${step}`);
  console.error(error);
  process.exit(1);
}

async function run(step, fn) {
  try {
    await fn();
    console.log(`✔ ${step}`);
  } catch (error) {
    fail(step, error);
  }
}

const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
  email: DEV_EMAIL,
  password: DEV_PASSWORD,
});
if (authError) fail('sign in as seeded dev user', authError);
const userId = authData.user.id;

await run('expenses: insert / delete round trip', async () => {
  const { data, error } = await supabase
    .from('expenses')
    .insert({
      category: 'groceries',
      amount: 12.5,
      spent_on: '2026-07-22',
      spent_at: new Date().toISOString(),
      note: 'smoke test',
    })
    .select('id, category, amount, spent_on, spent_at, note')
    .single();
  if (error) throw error;
  const { error: delError } = await supabase.from('expenses').delete().eq('id', data.id);
  if (delError) throw delError;
});

await run('recurring: insert / delete round trip', async () => {
  const { data, error } = await supabase
    .from('recurring')
    .insert({
      type: 'expense',
      name: 'Smoke test sub',
      amount: 9.99,
      cadence: 'monthly',
      term_kind: 'perpetual',
      category: 'subscriptions',
    })
    .select('id, type, name, amount, cadence, term_kind, end_date, category')
    .single();
  if (error) throw error;
  const { error: delError } = await supabase.from('recurring').delete().eq('id', data.id);
  if (delError) throw delError;
});

await run('profiles.savings_goal: read / update / restore', async () => {
  const { data: before, error: readError } = await supabase
    .from('profiles')
    .select('savings_goal')
    .eq('id', userId)
    .single();
  if (readError) throw readError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ savings_goal: before.savings_goal + 1 })
    .eq('id', userId);
  if (updateError) throw updateError;

  const { error: restoreError } = await supabase
    .from('profiles')
    .update({ savings_goal: before.savings_goal })
    .eq('id', userId);
  if (restoreError) throw restoreError;
});

await run('savings_targets: insert / update / delete round trip', async () => {
  const { data, error } = await supabase
    .from('savings_targets')
    .insert({
      name: 'Smoke test target',
      category: 'travel',
      goal_amount: 1000,
      target_date: '2027-01-01',
      priority: 'high',
      ai_verdict: 'Smoke test verdict',
    })
    .select(
      'id, name, category, goal_amount, saved_amount, target_date, priority, ai_verdict, status'
    )
    .single();
  if (error) throw error;

  const { error: updateError } = await supabase
    .from('savings_targets')
    .update({ saved_amount: 100 })
    .eq('id', data.id);
  if (updateError) throw updateError;

  const { error: delError } = await supabase.from('savings_targets').delete().eq('id', data.id);
  if (delError) throw delError;
});

console.log('\nAll Supabase smoke tests passed.');
