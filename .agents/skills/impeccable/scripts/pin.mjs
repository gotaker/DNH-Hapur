#!/usr/bin/env node
/**
 * pin.mjs — write or remove a `$<command>` shortcut that delegates to
 * `$impeccable <command>` in every harness directory present in the repo.
 *
 * Usage:
 *   node .agents/skills/impeccable/scripts/pin.mjs pin <command>
 *   node .agents/skills/impeccable/scripts/pin.mjs unpin <command>
 *
 * Supported harnesses (only present ones are touched):
 *   .cursor/commands/<command>.md   — Cursor slash-command
 *   .claude/commands/<command>.md   — Claude Code slash-command
 *
 * Result is reported as a single JSON object on stdout so the agent can
 * relay the outcome cleanly. Errors go to stderr and exit non-zero.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const COMMANDS = new Set([
  'craft', 'shape', 'teach', 'document', 'extract',
  'critique', 'audit', 'polish',
  'bolder', 'quieter', 'distill', 'harden', 'onboard',
  'animate', 'colorize', 'typeset', 'layout', 'delight', 'overdrive',
  'clarify', 'adapt', 'optimize',
  'live',
]);

function findRepoRoot(startDir) {
  let dir = startDir;
  for (let i = 0; i < 12; i++) {
    if (existsSync(join(dir, 'package.json')) || existsSync(join(dir, '.git'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}

function fail(message, extra = {}) {
  process.stderr.write(`pin.mjs: ${message}\n`);
  process.stdout.write(JSON.stringify({ ok: false, error: message, ...extra }, null, 2) + '\n');
  process.exit(1);
}

const [, , rawAction, rawCommand] = process.argv;
const action = (rawAction ?? '').toLowerCase();
const command = (rawCommand ?? '').toLowerCase();

if (!['pin', 'unpin'].includes(action)) {
  fail(`first argument must be "pin" or "unpin", got "${rawAction ?? ''}"`);
}
if (!command) fail('second argument <command> is required');
if (!COMMANDS.has(command)) {
  fail(`unknown command "${command}"`, { knownCommands: [...COMMANDS].sort() });
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(here);

const harnesses = [
  { id: 'cursor', dir: join(repoRoot, '.cursor', 'commands') },
  { id: 'claude', dir: join(repoRoot, '.claude', 'commands') },
];

const SHORTCUT_BODY = (cmd) => `---
description: Shortcut for "$impeccable ${cmd}"
---

Invoke the impeccable skill with the \`${cmd}\` sub-command. Treat any text the
user provides after the slash as the target argument.

Run: \`$impeccable ${cmd} {{args}}\`
`;

const results = [];

for (const { id, dir } of harnesses) {
  const harnessRoot = dirname(dir);
  if (!existsSync(harnessRoot)) {
    results.push({ harness: id, dir, action: 'skip', reason: 'harness not present' });
    continue;
  }

  const file = join(dir, `${command}.md`);

  if (action === 'pin') {
    try {
      mkdirSync(dir, { recursive: true });
      const next = SHORTCUT_BODY(command);
      const exists = existsSync(file);
      if (exists && readFileSync(file, 'utf8') === next) {
        results.push({ harness: id, dir, action: 'unchanged', file });
        continue;
      }
      writeFileSync(file, next, 'utf8');
      results.push({ harness: id, dir, action: exists ? 'updated' : 'created', file });
    } catch (err) {
      results.push({ harness: id, dir, action: 'error', file, error: String(err?.message ?? err) });
    }
    continue;
  }

  // unpin
  if (!existsSync(file)) {
    results.push({ harness: id, dir, action: 'absent', file });
    continue;
  }
  try {
    const stat = statSync(file);
    if (!stat.isFile()) {
      results.push({ harness: id, dir, action: 'skip', file, reason: 'not a regular file' });
      continue;
    }
    rmSync(file);
    results.push({ harness: id, dir, action: 'removed', file });
  } catch (err) {
    results.push({ harness: id, dir, action: 'error', file, error: String(err?.message ?? err) });
  }
}

const ok = !results.some((r) => r.action === 'error');
process.stdout.write(JSON.stringify({ ok, action, command, repoRoot, results }, null, 2) + '\n');
process.exit(ok ? 0 : 1);
