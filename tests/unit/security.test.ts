import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Security floor regression test.
 *
 * Each entry below corresponds to a Dependabot advisory we patched on
 * 2026-05-08. The test asserts that:
 *
 *   1. The patched-version override is still present in `package.json`
 *      `pnpm.overrides`, so a future `pnpm update` cannot silently
 *      regress to a vulnerable version of a transitive dependency.
 *   2. Every installed copy of the package (as reported by `pnpm why`)
 *      is at or above the patched floor.
 *
 * If a new advisory lands against any of these packages, raise the
 * floor here _and_ in `package.json` — the test will fail if the
 * lockfile drifts below the new floor.
 *
 * Adding a new entry is the canonical way to lock in a fix, not a
 * one-off `pnpm update`.
 */
const FLOORS = [
  // Critical RCE via VM context escape (CVE-2025-61927).
  { name: 'happy-dom', minimum: '20.8.9', source: 'GHSA-37j7-fg3j-429f' },
  // High: cookie leak across origins (CVE-2026-34226).
  { name: 'happy-dom', minimum: '20.8.9', source: 'GHSA-w4gp-fjgq-3q4g' },
  // High: ECMAScript module compiler executes unsanitised export names.
  { name: 'happy-dom', minimum: '20.8.8', source: 'GHSA-6q6h-j7hj-3r64' },
  // Moderate: dompurify XSS / prototype-pollution chain.
  { name: 'dompurify', minimum: '3.4.0', source: 'GHSA-h7mw-gpvr-xq4m' },
  // Moderate: esbuild dev-server CORS bypass.
  { name: 'esbuild', minimum: '0.25.0', source: 'GHSA-67mh-4wv8-2f99' },
  // Moderate: postcss CSS-stringify XSS.
  { name: 'postcss', minimum: '8.5.10', source: 'GHSA-qx2v-qp2m-jg93' },
  // Moderate: uuid buffer bounds check.
  { name: 'uuid', minimum: '11.1.1', source: 'GHSA-w5hq-g745-h8pq' },
] as const;

interface PackageJson {
  pnpm?: {
    overrides?: Record<string, string>;
  };
}

const repoRoot = resolve(__dirname, '../..');
const packageJson = JSON.parse(
  readFileSync(resolve(repoRoot, 'package.json'), 'utf8'),
) as PackageJson;

function compareSemver(a: string, b: string): number {
  const parse = (v: string) => v.split('-')[0].split('.').map((n) => Number.parseInt(n, 10));
  const [a1, a2 = 0, a3 = 0] = parse(a);
  const [b1, b2 = 0, b3 = 0] = parse(b);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

// `pnpm why` is the only authoritative way to list every installed copy
// of a transitive dependency. We invoke it via execFileSync (no shell
// interpolation; the package name is a constant from FLOORS) and parse
// `name@version` tokens out of the human output, which is stable enough
// across pnpm 10.x.
function installedVersions(name: string): string[] {
  let raw = '';
  try {
    raw = execFileSync('pnpm', ['why', name], {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 16 * 1024 * 1024,
    });
  } catch {
    return [];
  }

  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // Match `name@version` only when `name` is at a real package boundary
  // — start of line, whitespace, or a tree-drawing glyph. This rejects
  // false positives like `@tailwindcss/postcss@4.2.4` matching `postcss`.
  const re = new RegExp(
    `(?:^|[\\s│├└─┬])${escaped}@(\\d+\\.\\d+\\.\\d+[\\w.-]*)`,
    'gm',
  );
  const versions = new Set<string>();
  for (const match of raw.matchAll(re)) versions.add(match[1]);
  return [...versions];
}

describe('security floor — patched dependency versions', () => {
  for (const floor of FLOORS) {
    it(`${floor.name} >= ${floor.minimum} (${floor.source})`, () => {
      const installed = installedVersions(floor.name);
      // We need at least one copy in the tree; if pnpm has multiple,
      // every copy must be at or above the floor.
      expect(installed.length, `expected to find ${floor.name} in pnpm tree`).toBeGreaterThan(0);
      for (const version of installed) {
        expect(
          compareSemver(version, floor.minimum),
          `${floor.name}@${version} is below patched floor ${floor.minimum} (${floor.source}). ` +
            `Update pnpm.overrides in package.json or bump the offending direct dependency.`,
        ).toBeGreaterThanOrEqual(0);
      }
    });
  }

  it('package.json declares pnpm overrides for every patched transitive', () => {
    const overrides = packageJson.pnpm?.overrides ?? {};
    const transitives = ['dompurify', 'esbuild', 'postcss', 'uuid', 'happy-dom'];
    for (const pkg of transitives) {
      const matched = Object.keys(overrides).some(
        (key) => key === pkg || key.startsWith(`${pkg}@`),
      );
      expect(
        matched,
        `pnpm.overrides must pin ${pkg} away from known-vulnerable ranges`,
      ).toBe(true);
    }
  });
});
