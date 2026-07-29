#!/usr/bin/env node
import { execSync } from 'node:child_process';

const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
const ALLOWED = ['main', 'develop'];
const PATTERN = /^(feat|fix|chore|refactor|docs|test|ci)\/([A-Z]+-\d+-)?[a-z0-9-]+$/;

if (ALLOWED.includes(branch) || PATTERN.test(branch)) {
  process.exit(0);
}

console.error(`
Branch name "${branch}" doesn't match the required pattern:

  <type>/<TICKET-ID>-<kebab-case-summary>   (TICKET-ID optional)

  type: feat | fix | chore | refactor | docs | test | ci

Examples:
  feat/LEG-60-savings-targets-add-button
  chore/upgrade-expo-sdk

See CLAUDE.md "Branching & commits".
`);
process.exit(1);
