#!/usr/bin/env node
// `pnpm web:dev -- --localAgent` also spawns the agent's own dev server (agent/src/server.ts) and
// points RAILWAY_AGENT_SERVICE_URL at it instead of the deployed one — see agent/.env.example for
// the env vars the agent process itself still needs (ANTHROPIC_API_KEY, etc).
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const agentDir = path.resolve(here, '../../../agent');
const LOCAL_AGENT_URL = 'http://localhost:3060';

const useLocalAgent = process.argv
  .slice(2)
  .some((arg) => arg === '--localAgent' || arg === '--localAgent=true');

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
  run('next', ['dev'], { env: { ...process.env, RAILWAY_AGENT_SERVICE_URL: LOCAL_AGENT_URL } });
} else {
  run('next', ['dev']);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => children.forEach((child) => child.kill(signal)));
}
