#!/usr/bin/env node
/**
 * One-time (idempotent, safe to re-run) setup of the dev@moniq.app test user against whichever
 * Supabase backend EXPO_PUBLIC_SUPABASE_URL/ANON_KEY point to (local or hosted, via .env) — mirrors
 * `supabase/seed.sql`'s user + recurring rows, which only ever runs locally on `supabase db reset`
 * and has no hosted equivalent. Daily expense data after this is `pnpm seed:expenses`'s job, not
 * this script's — this only creates the account and its recurring income/costs once.
 *
 * Usage: pnpm seed:hosted-bootstrap
 */

import { readFileSync } from 'node:fs';

import { createClient } from '@supabase/supabase-js';

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

// Mirrors supabase/seed.sql exactly.
const RECURRING_ROWS = [
  { type: 'income', name: 'Salary', amount: 2400, cadence: 'monthly', term_kind: 'perpetual' },
  { type: 'income', name: 'Freelance', amount: 350, cadence: 'monthly', term_kind: 'perpetual' },
  { type: 'expense', name: 'Rent', amount: 950, cadence: 'monthly', term_kind: 'perpetual' },
  {
    type: 'expense',
    name: 'Health insurance',
    amount: 120,
    cadence: 'monthly',
    term_kind: 'perpetual',
  },
  { type: 'expense', name: 'Transit pass', amount: 59, cadence: 'monthly', term_kind: 'perpetual' },
  { type: 'expense', name: 'Gym', amount: 30, cadence: 'monthly', term_kind: 'perpetual' },
  { type: 'expense', name: 'Phone', amount: 29, cadence: 'monthly', term_kind: 'perpetual' },
  { type: 'expense', name: 'Spotify', amount: 11, cadence: 'monthly', term_kind: 'perpetual' },
];

async function getOrCreateUser() {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });
  // signUp() doesn't error on an already-registered email (anti-enumeration) — it just returns no
  // session instead, so "no error" alone doesn't mean it's a new, signed-in account.
  if (!signUpError && signUpData.session) {
    console.log(`✔ Created ${DEV_EMAIL} and signed in`);
    return signUpData.user.id;
  }
  if (signUpError && !/already registered|already exists/i.test(signUpError.message)) {
    throw signUpError;
  }

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: DEV_EMAIL,
    password: DEV_PASSWORD,
  });
  if (signInError) throw signInError;
  console.log(`✔ ${DEV_EMAIL} already exists, signed in`);
  return signInData.user.id;
}

async function main() {
  const userId = await getOrCreateUser();

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ savings_goal: 350 })
    .eq('id', userId);
  if (profileError) throw profileError;
  console.log('✔ profiles.savings_goal set to 350');

  const { count, error: countError } = await supabase
    .from('recurring')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  if (countError) throw countError;

  if (count > 0) {
    console.log(`✔ recurring already has ${count} row(s), leaving as-is`);
    return;
  }

  const { error: insertError } = await supabase.from('recurring').insert(RECURRING_ROWS);
  if (insertError) throw insertError;
  console.log(`✔ Seeded ${RECURRING_ROWS.length} recurring row(s)`);
}

main().catch((error) => {
  console.error('✘ Bootstrap failed');
  console.error(error);
  process.exit(1);
});
