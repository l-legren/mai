#!/usr/bin/env node
// Stop hook: for TS files changed this turn,
//   1. typecheck the project,
//   2. run the test suite (the project always has real test files, so no "no tests found" guard needed),
//   3. flag changed src/services or src/data files that have no matching test.
// Exit 2 with a report = tell the model to fix / ask the user before finishing.
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

function readStdin() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

let input = {};
try {
  input = JSON.parse(readStdin() || '{}');
} catch {
  // proceed with an empty input rather than failing the hook
}

// Prevent an infinite loop: if we already blocked once this stop, let it through.
if (input.stop_hook_active) process.exit(0);

let root;
try {
  root = fs.realpathSync(process.env.CLAUDE_PROJECT_DIR || process.cwd());
} catch {
  process.exit(0);
}
if (!root) process.exit(0);

function run(cmd, args) {
  return spawnSync(cmd, args, { cwd: root, encoding: 'utf8' });
}

function changedFiles() {
  const tracked = run('git', ['diff', '--name-only', '--diff-filter=d', 'HEAD', '--', '*.ts', '*.tsx']);
  const untracked = run('git', ['ls-files', '--others', '--exclude-standard', '--', '*.ts', '*.tsx']);
  return `${tracked.stdout || ''}\n${untracked.stdout || ''}`
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

const changed = changedFiles();
if (changed.length === 0) process.exit(0);

let report = '';

// Plain `tsc --noEmit` needs a single root tsconfig.json, which no longer exists post-LEG-97
// (the app's tsconfig moved to apps/mobile/) — turbo fans out typecheck across every workspace
// package instead (apps/mobile, packages/*, agent), same as the rest of this repo's tooling.
const typecheck = run('pnpm', ['exec', 'turbo', 'run', 'typecheck']);
if (typecheck.status !== 0) {
  report += `\n### typecheck FAILED\n${typecheck.stdout || ''}${typecheck.stderr || ''}`;
}

const hasTestFiles = run('git', ['ls-files', '--', '*.test.ts', '*.test.tsx']).stdout.trim().length > 0;
if (hasTestFiles) {
  const test = run('pnpm', ['test']);
  if (test.status !== 0) {
    report += `\n### tests FAILED\n${test.stdout || ''}${test.stderr || ''}`;
  }
}

// Missing-test nudge: changed services/data logic files with no matching test. Scoped to the
// high-value layers CLAUDE.md calls out — apps/mobile/src/{services,data} (post-LEG-97 app
// location) and packages/api/src (the Supabase data layer, extracted from src/data in LEG-124).
// hooks/ and app/ are excluded because "is this hook non-trivial enough to test" is a judgment
// call, not something a filename check can safely enforce.
const missing = [];
for (const file of changed) {
  const inAppLayer = /^apps\/mobile\/src\/(services|data)\/.*\.ts$/.test(file);
  const inApiPackage = /^packages\/api\/src\/.*\.ts$/.test(file);
  if (!inAppLayer && !inApiPackage) continue;
  if (/\.(test|spec)\.ts$/.test(file) || /\/index\.ts$/.test(file) || file.endsWith('.d.ts')) continue;
  const testPath = file.replace(/\.ts$/, '.test.ts');
  if (!fs.existsSync(path.join(root, testPath))) missing.push(file);
}

let msg = '';
if (report) msg += `Checks failed — fix before finishing:${report}\n`;
if (missing.length) {
  msg +=
    `These changed source files have no matching test — ask the user whether to add tests ` +
    `(do not add them unprompted):\n${missing.map((f) => `  - ${f}`).join('\n')}\n`;
}

if (msg) {
  process.stderr.write(msg + '\n');
  process.exit(2);
}
process.exit(0);
