#!/usr/bin/env node
/**
 * Seeds randomized, realistic expenses for a given user against the real Supabase backend (local
 * or hosted, via .env) — unlike `supabase/seed.sql`'s fixed rows (only applied on `supabase db
 * reset`), this can be re-run any time to keep a test account's recent history looking real.
 *
 * Usage:
 *   pnpm seed:expenses                      seed *today* only (the one to put on a schedule)
 *   pnpm seed:expenses -- --backfill 30      seed the last 30 days (today included), for a fresh account
 *   pnpm seed:expenses -- --email a@b.com --password secret
 *
 * Defaults to the local dev seed account (dev@moniq.app / password123, see supabase/seed.sql).
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

function parseArgs(argv) {
  const args = { email: 'dev@moniq.app', password: 'password123', backfill: 1 };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--email') args.email = argv[++i];
    else if (argv[i] === '--password') args.password = argv[++i];
    else if (argv[i] === '--backfill') args.backfill = Number.parseInt(argv[++i], 10);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY. Copy .env.example to .env.'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Weighted so "today" looks like a real day: groceries/transport show up often, clothing/other rarely.
const CATEGORY_WEIGHTS = [
  { category: 'groceries', weight: 25, min: 8, max: 55 },
  { category: 'transport', weight: 20, min: 3, max: 18 },
  { category: 'restaurants', weight: 20, min: 10, max: 42 },
  { category: 'drinks', weight: 15, min: 3, max: 11 },
  { category: 'clothing', weight: 10, min: 18, max: 85 },
  { category: 'other', weight: 10, min: 5, max: 30 },
];

// Most days have 1-2 transactions; occasionally none or a busier 3.
const COUNT_WEIGHTS = [
  { count: 0, weight: 10 },
  { count: 1, weight: 40 },
  { count: 2, weight: 35 },
  { count: 3, weight: 15 },
];

function weightedPick(entries) {
  const total = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    roll -= entry.weight;
    if (roll <= 0) return entry;
  }
  return entries[entries.length - 1];
}

function randomAmount(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

/** One realistic day's worth of transactions for `daysAgo` days before today. */
function buildDayRows(daysAgo) {
  const { count } = weightedPick(COUNT_WEIGHTS);
  const rows = [];
  for (let i = 0; i < count; i++) {
    const { category, min, max } = weightedPick(CATEGORY_WEIGHTS);
    const spentAt = new Date();
    spentAt.setDate(spentAt.getDate() - daysAgo);
    spentAt.setHours(8 + Math.floor(Math.random() * 13), Math.floor(Math.random() * 60), 0, 0);
    rows.push({
      category,
      amount: randomAmount(min, max),
      spent_on: spentAt.toISOString().slice(0, 10),
      spent_at: spentAt.toISOString(),
    });
  }
  return rows;
}

async function main() {
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: args.email,
    password: args.password,
  });
  if (authError) {
    console.error(`✘ Sign-in failed for ${args.email}: ${authError.message}`);
    process.exit(1);
  }

  const rows = [];
  for (let daysAgo = 0; daysAgo < args.backfill; daysAgo++) {
    rows.push(...buildDayRows(daysAgo));
  }

  if (rows.length === 0) {
    console.log(`No transactions rolled for this run (that's realistic too — some days are 0).`);
    return;
  }

  const { error: insertError } = await supabase.from('expenses').insert(rows);
  if (insertError) {
    console.error(`✘ Insert failed: ${insertError.message}`);
    process.exit(1);
  }

  console.log(
    `✔ Seeded ${rows.length} expense(s) across ${args.backfill} day(s) for ${auth.user.email}`
  );
}

main();
