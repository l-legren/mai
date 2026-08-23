#!/usr/bin/env node
// PreToolUse guard for Claude Code.
// Blocks: (1) reading/editing .env files (secrets), (2) any path that resolves
// outside the monorepo root. Exit 2 = block the tool and tell the model why.
'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');

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
  process.exit(0);
}

const file = input?.tool_input?.file_path ?? input?.tool_input?.path ?? '';
if (!file) process.exit(0);

let root;
try {
  root = fs.realpathSync(process.env.CLAUDE_PROJECT_DIR || process.cwd());
} catch {
  process.exit(0);
}
if (!root) process.exit(0);

const base = path.basename(file);

// 1) Block .env files, but allow templates (.env.example, .env.*.example).
if (base === '.env' || base.startsWith('.env.')) {
  if (!base.endsWith('.example')) {
    console.error(
      `BLOCKED: '${file}' is an environment file. Reading or editing secrets is not allowed — use .env.example.`,
    );
    process.exit(2);
  }
}

// 2) Block paths outside the monorepo, with one exception: this project's
//    Claude Code auto-memory directory (~/.claude/projects/<slug>/memory/),
//    which necessarily lives outside the repo but is legitimate for the
//    memory system to read/write. Resolve '..' without requiring the file to
//    exist (Write creates new files), then prefix-check against allowed roots.
const memoryRoot = path.join(
  os.homedir(),
  '.claude',
  'projects',
  root.replace(/[/\\]/g, '-'),
  'memory',
);

const abs = path.resolve(root, file);
const isInRepo = abs === root || abs.startsWith(root + path.sep);
const isInMemoryDir = abs === memoryRoot || abs.startsWith(memoryRoot + path.sep);
if (!isInRepo && !isInMemoryDir) {
  console.error(`BLOCKED: '${file}' resolves outside the monorepo (${root}).`);
  process.exit(2);
}

process.exit(0);
