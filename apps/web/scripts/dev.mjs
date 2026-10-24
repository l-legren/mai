#!/usr/bin/env node
// `pnpm web:dev -- --localAgent` also spawns the agent's own dev server (agent/src/server.ts) and
// points AGENT_SERVICE_URL at it instead of the deployed one — see agent/.env.example for the env
// vars the agent process itself still needs (ANTHROPIC_API_KEY, etc).
//
// `pnpm web:dev -- --cloudAgent` skips spawning a local agent and talks to the real Cloud Run
// deployment instead (whatever AGENT_SERVICE_URL already resolves to via .env.local). This still
// runs plain `next dev`, not `vercel dev` — so minting the Cloud Run ID token relies on whatever
// VERCEL_OIDC_TOKEN snapshot is already in .env.local (from `vercel link`/`vercel env pull`), not
// a live auto-refreshing one. Development-environment tokens last ~12h; once it expires, requests
// fail with "could not mint Cloud Run ID token" again until you re-run `vercel env pull .env.local`.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const agentDir = path.resolve(here, '../../../agent');
const LOCAL_AGENT_URL = 'http://localhost:3060';

const flags = process.argv.slice(2);
const hasFlag = (name) => flags.some((arg) => arg === `--${name}` || arg === `--${name}=true`);
const useLocalAgent = hasFlag('localAgent');
const useCloudAgent = hasFlag('cloudAgent');

if (useLocalAgent && useCloudAgent) {
  console.error('--localAgent and --cloudAgent are mutually exclusive — pick one.');
  process.exit(1);
}

const children = [];

function run(command, args, options = {}) {
  const child = spawn(command, args, { stdio: 'inherit', ...options });
  children.push(child);
  child.on('exit', (code) => {
    for (const other of children) if (other !== child) other.kill('SIGTERM');
    process.exitCode = code ?? 0;
  });
  return child;
}

if (useLocalAgent) {
  run('pnpm', ['--dir', agentDir, 'start:dev']);
  run('next', ['dev'], { env: { ...process.env, AGENT_SERVICE_URL: LOCAL_AGENT_URL } });
} else {
  // Not validated here: .env.local is loaded by the `next` process itself, not inherited by this
  // wrapper script, so this process can't see AGENT_SERVICE_URL's actual resolved value. If it's
  // missing, getAgentServiceUrl() already throws a clear error, caught and logged by the route.
  if (useCloudAgent) console.log('--cloudAgent: talking to the deployed Cloud Run agent');
  run('next', ['dev']);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => children.forEach((child) => child.kill(signal)));
}
