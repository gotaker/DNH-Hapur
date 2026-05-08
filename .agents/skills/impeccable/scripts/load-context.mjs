#!/usr/bin/env node
/**
 * load-context.mjs — impeccable context loader for DNH Hapur.
 *
 * Resolves PRODUCT.md and DESIGN.md (case-insensitive) and emits a single
 * JSON object on stdout. The skill prompt consumes the JSON whole; do not
 * pipe through head/tail/grep/jq — they will truncate the contract.
 *
 * Resolution order (first directory containing PRODUCT.md wins):
 *   1. $IMPECCABLE_CONTEXT_DIR (absolute, or relative to cwd)
 *   2. <repo root>
 *   3. <repo root>/.agents/context
 *   4. <repo root>/docs
 *
 * Repo root is the nearest ancestor of this file containing package.json
 * or .git, falling back to the script's own grandparent-of-grandparent.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const FILES = ['PRODUCT.md', 'DESIGN.md'];

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

function existsSync(p) {
  try {
    statSync(p);
    return true;
  } catch {
    return false;
  }
}

function findFileCaseInsensitive(dir, name) {
  if (!existsSync(dir)) return null;
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return null;
  }
  const target = name.toLowerCase();
  for (const entry of entries) {
    if (entry.toLowerCase() === target) {
      const full = join(dir, entry);
      try {
        if (statSync(full).isFile()) return full;
      } catch {
        return null;
      }
    }
  }
  return null;
}

function summarize(content) {
  const text = content ?? '';
  const trimmed = text.trim();
  const placeholder = /\[TODO\]|\[FILL\]|^TBD\b/im.test(trimmed);
  const empty = trimmed.length === 0;
  const tooShort = trimmed.length > 0 && trimmed.length < 200;
  return {
    chars: trimmed.length,
    lines: trimmed === '' ? 0 : trimmed.split(/\r?\n/).length,
    placeholder,
    empty,
    tooShort,
    valid: !empty && !tooShort && !placeholder,
  };
}

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = findRepoRoot(here);

const override = process.env.IMPECCABLE_CONTEXT_DIR;
const overrideDir = override
  ? isAbsolute(override)
    ? override
    : resolve(process.cwd(), override)
  : null;

const candidates = overrideDir
  ? [overrideDir]
  : [repoRoot, join(repoRoot, '.agents/context'), join(repoRoot, 'docs')];

let chosenDir = null;
for (const dir of candidates) {
  if (findFileCaseInsensitive(dir, 'PRODUCT.md')) {
    chosenDir = dir;
    break;
  }
}
if (!chosenDir) chosenDir = candidates[0];

const result = {
  repoRoot,
  contextDir: chosenDir,
  searched: candidates,
  override: overrideDir,
};

for (const file of FILES) {
  const key = file.replace(/\.md$/i, '').toLowerCase();
  const path = findFileCaseInsensitive(chosenDir, file);
  if (!path) {
    result[key] = { found: false, path: null, content: '', summary: summarize('') };
    continue;
  }
  const content = readFileSync(path, 'utf8');
  result[key] = {
    found: true,
    path,
    content,
    summary: summarize(content),
  };
}

result.gates = {
  productPresent: result.product?.found === true,
  productValid: result.product?.summary?.valid === true,
  designPresent: result.design?.found === true,
  designValid: result.design?.summary?.valid === true,
};

process.stdout.write(JSON.stringify(result, null, 2) + '\n');
