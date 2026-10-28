#!/usr/bin/env node
// Extends public/sample-bank-statement.csv with synthetic transactions up through yesterday
// (UTC), then trims the oldest rows so the file never exceeds MAX_ROWS — a rolling window to
// stay under the demo CSV upload limit. Re-running the same day is a no-op (idempotent).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.resolve(here, '../public/sample-bank-statement.csv');
const MAX_ROWS = 5000;
const TARGET_BALANCE = 3000;

const RECURRING = [
  { day: 1, name: 'SPOTIFY AB', desc: () => 'STOCKHOLM SE KAUFUMSATZ', amount: -10.99 },
  { day: 3, name: 'NETFLIX.COM', desc: () => 'NETFLIX.COM IE KAUFUMSATZ', amount: -12.99 },
  { day: 5, name: 'HAUSVERWALTUNG MUELLER', desc: (d) => `MIETE ${mmYYYY(d)}`, amount: -850 },
  {
    day: 8,
    name: 'ANTHROPIC* CLAUDE SUB',
    desc: () => 'ANTHROPIC.C US KAUFUMSATZ',
    amount: -21.42,
  },
  { day: 15, name: 'eprimo GmbH', desc: () => 'eprimo sagt danke', amount: -40 },
  {
    day: 20,
    name: 'URBAN SPORTS CLUB 4969',
    desc: () => 'BERLIN DE KAUFUMSATZ Apple Pay',
    amount: -64,
  },
  { day: 27, name: 'ARBEITGEBER GMBH', desc: (d) => `GEHALT ${mmYYYY(d)}`, amount: 2450 },
];

const OCCASIONAL = [
  {
    chance: 0.11,
    name: 'DB VERTRIEB GMBH',
    desc: 'FAHRKARTE ARN INTERNET',
    min: -59.74,
    max: -24.51,
    scales: true,
  },
  { chance: 0.057, name: 'MAX MUSTERMANN', desc: 'RUECKZAHLUNG ABENDESSEN', amount: 23.33 },
  { chance: 0.063, name: 'PAYPAL EUROPE SARL', desc: 'RUECKERSTATTUNG BESTELLUNG', amount: 28.91 },
];

const VISA_MERCHANTS = [
  {
    name: 'VISA REWE MARTIN NOTHEL',
    desc: 'BERLIN DE KAUFUMSATZ Apple Pay',
    min: -35.04,
    max: -3.51,
    weight: 434,
  },
  {
    name: 'VISA STARBUCKS COFFEE',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -8.02,
    max: -2.81,
    weight: 385,
  },
  {
    name: 'VISA EDEKA SUPERMARKT',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -55.03,
    max: -13.0,
    weight: 378,
  },
  {
    name: 'VISA SPAETI KOWALSKI',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -14.96,
    max: -1.41,
    weight: 338,
  },
  {
    name: 'VISA DM DROGERIE MARKT',
    desc: 'BERLIN DE KAUFUMSATZ Apple Pay',
    min: -18.97,
    max: -3.51,
    weight: 329,
  },
  {
    name: 'VISA ZALANDO SE',
    desc: 'BERLIN DE KAUFUMSATZ ARN INTERNET',
    min: -85.75,
    max: -44.81,
    weight: 290,
  },
  {
    name: 'VISA VAPIANO BERLIN MITTE',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -20.4,
    max: -10.5,
    weight: 273,
  },
  {
    name: 'VISA MCDONALDS 4521',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -19.87,
    max: -4.95,
    weight: 263,
  },
  {
    name: 'VISA KAUFLAND BERLIN',
    desc: 'BERLIN NEUK DE KAUFUMSATZ',
    min: -51.2,
    max: -7.04,
    weight: 240,
  },
  {
    name: 'VISA MEDIAMARKT BERLIN',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -101.51,
    max: -28.24,
    weight: 230,
  },
  {
    name: 'VISA DOMINOS PIZZA',
    desc: 'BERLIN DE KAUFUMSATZ ARN INTERNET',
    min: -27.93,
    max: -9.13,
    weight: 229,
  },
  {
    name: 'VISA ALDI SUED FILIALE',
    desc: 'BERLIN DE KAUFUMSATZ Apple Pay',
    min: -21.15,
    max: -4.96,
    weight: 204,
  },
  {
    name: 'VISA UBER TRIP',
    desc: 'AMSTERDAM NL KAUFUMSATZ',
    min: -23.25,
    max: -12.61,
    weight: 137,
  },
  {
    name: 'VISA H AND M BERLIN',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -37.61,
    max: -13.42,
    weight: 131,
  },
  {
    name: 'VISA LIDL FILIALE 1121',
    desc: 'BERLIN DE KAUFUMSATZ Apple Pay',
    min: -29.99,
    max: -4.4,
    weight: 126,
  },
  {
    name: 'VISA IMBISS CURRY 61',
    desc: 'BERLIN DE KAUFUMSATZ',
    min: -11.03,
    max: -4.22,
    weight: 120,
  },
];

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mmYYYY(date) {
  return `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${date.getUTCFullYear()}`;
}

function formatDate(date) {
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${dd}.${mm}.${date.getUTCFullYear()}`;
}

function parseDate(s) {
  const [dd, mm, yyyy] = s.split('.').map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}

function addDays(date, n) {
  return new Date(date.getTime() + n * 86400000);
}

function todayUTC() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function germanAmount(n) {
  const sign = n < 0 ? '-' : '';
  const [intPart, decPart] = Math.abs(n).toFixed(2).split('.');
  return `${sign}${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${decPart}`;
}

function parseGermanAmount(s) {
  return parseFloat(s.replace(/\./g, '').replace(',', '.'));
}

function randomAmount(min, max) {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function pickWeighted(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    if (r < item.weight) return item;
    r -= item.weight;
  }
  return items[items.length - 1];
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function formatRow(date, name, desc, amount, balance) {
  const ds = formatDate(date);
  return [
    ds,
    ds,
    name,
    'Lastschrift',
    desc,
    germanAmount(balance),
    'EUR',
    germanAmount(amount),
    'EUR',
  ].join(';');
}

// Discretionary spend scales with how far the balance sits from TARGET_BALANCE, so the demo
// balance stays in a realistic band indefinitely instead of drifting to zero or climbing forever.
function spendScale(balance) {
  return clamp(balance / TARGET_BALANCE, 0.5, 1.4);
}

function generateDay(date, startBalance) {
  const scale = spendScale(startBalance);
  const txns = [];

  for (const r of RECURRING) {
    if (date.getUTCDate() === r.day)
      txns.push({ name: r.name, desc: r.desc(date), amount: r.amount });
  }

  for (const o of OCCASIONAL) {
    if (Math.random() >= o.chance) continue;
    const base = o.amount ?? randomAmount(o.min, o.max);
    const amount = o.scales ? clamp(base * scale, -200, -0.5) : base;
    txns.push({ name: o.name, desc: o.desc, amount: Math.round(amount * 100) / 100 });
  }

  const visaCount = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < visaCount; i++) {
    const merchant = pickWeighted(VISA_MERCHANTS);
    const amount = clamp(randomAmount(merchant.min, merchant.max) * scale, -200, -0.5);
    txns.push({ name: merchant.name, desc: merchant.desc, amount: Math.round(amount * 100) / 100 });
  }

  shuffle(txns);

  const rows = [];
  let balance = startBalance;
  for (const t of txns) {
    balance = Math.round((balance + t.amount) * 100) / 100;
    rows.push(formatRow(date, t.name, t.desc, t.amount, balance));
  }

  return { rows, balance };
}

function parseThroughArg() {
  const arg = process.argv.find((a) => a.startsWith('--through='));
  if (!arg) return addDays(todayUTC(), -1);
  const [yyyy, mm, dd] = arg.slice('--through='.length).split('-').map(Number);
  return new Date(Date.UTC(yyyy, mm - 1, dd));
}

function main() {
  const raw = fs.readFileSync(CSV_PATH, 'utf8');
  const lines = raw.split('\n').filter((l) => l.length > 0);
  const header = lines[0];
  let dataLines = lines.slice(1);

  const lastCols = dataLines[dataLines.length - 1].split(';');
  let currentDate = addDays(parseDate(lastCols[0]), 1);
  let balance = parseGermanAmount(lastCols[5]);
  const through = parseThroughArg();

  const newRows = [];
  while (currentDate.getTime() <= through.getTime()) {
    const day = generateDay(currentDate, balance);
    newRows.push(...day.rows);
    balance = day.balance;
    currentDate = addDays(currentDate, 1);
  }

  if (newRows.length === 0) {
    console.log('generate-bank-statement: already up to date, nothing to do');
    return;
  }

  dataLines = [...dataLines, ...newRows];
  if (dataLines.length > MAX_ROWS) dataLines = dataLines.slice(dataLines.length - MAX_ROWS);

  fs.writeFileSync(CSV_PATH, [header, ...dataLines].join('\n') + '\n');
  console.log(
    `generate-bank-statement: added ${newRows.length} rows through ${formatDate(through)}, total rows now ${dataLines.length}`
  );
}

main();
