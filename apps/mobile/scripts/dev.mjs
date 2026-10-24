#!/usr/bin/env node
// `pnpm start -- --localAgent` / `pnpm ios -- --localAgent` / `pnpm android -- --localAgent` also
// spawn the agent's own dev server (agent/src/server.ts) and point
// EXPO_PUBLIC_AGENT_SERVICE_URL at it instead of the deployed one — mirrors
// apps/web/scripts/dev.mjs's --localAgent, see agent/.env.example for the env vars the agent
// process itself still needs (ANTHROPIC_API_KEY, etc).
//
// Unlike web (always a browser on the same machine), the right localhost address here depends on
// where Expo actually runs the app, so the default (iOS Simulator, sharing the Mac's network
// stack) can be overridden: `--localAgent=http://10.0.2.2:3060` (Android Emulator's alias for the
// host machine) or `--localAgent=http://<your-lan-ip>:3060` (a physical device on the same Wi-Fi).
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const agentDir = path.resolve(here, '../../../agent');
const DEFAULT_LOCAL_AGENT_URL = 'http://localhost:3060';

// First positional arg is the expo CLI subcommand to run (`start`, `run:ios`, `run:android`) —
// see the "start"/"ios"/"android" scripts in package.json, which all route through this file.
const [expoCommand, ...rest] = process.argv.slice(2);

const localAgentArg = rest.find((arg) => arg === '--localAgent' || arg.startsWith('--localAgent='));
const useLocalAgent = localAgentArg !== undefined;
const localAgentValue = localAgentArg?.includes('=')
  ? localAgentArg.slice(localAgentArg.indexOf('=') + 1)
  : undefined;
const localAgentUrl =
  localAgentValue && localAgentValue !== 'true' ? localAgentValue : DEFAULT_LOCAL_AGENT_URL;

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
  run('expo', [expoCommand], {
    env: { ...process.env, EXPO_PUBLIC_AGENT_SERVICE_URL: localAgentUrl },
  });
} else {
  run('expo', [expoCommand]);
}

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => children.forEach((child) => child.kill(signal)));
}
