# Security playbook

This document describes how this codebase stays ahead of dependency
advisories and how the agent enforces it. The combined surface — local
script, regression test, and CI workflow — is what `CLAUDE.md` calls
the **security agent**.

The runtime security posture (response headers, `X-Robots-Tag`,
JSON-LD safety, robots/sitemap/RSS contracts) lives in
[`testing.md`](./testing.md) §2.5 and `CLAUDE.md` §5.6.1. This file is
about the **dependency** surface.

## 1. Layers

| Layer | What it does | When it runs |
|---|---|---|
| `pnpm audit --audit-level=moderate` | Fails on any moderate, high, or critical advisory in the production or dev tree. | Locally via `pnpm security:audit`; on every push, PR, and the nightly cron in `.github/workflows/security.yml`. |
| `tests/unit/security.test.ts` | Asserts every patched-version floor and that `pnpm.overrides` still pins each package known to have shipped a vulnerable transitive. | Locally via `pnpm test`; on every push and PR (`pnpm-audit` job). |
| `actions/dependency-review-action` | On a PR, fails if the diff introduces a dependency at or below `moderate` severity that wasn't already there on `main`. | PR-only, in `.github/workflows/security.yml`. |
| Dependabot alert summary | Surfaces every open alert from GitHub's database into the GitHub Actions step summary. Informational; the regression test is the authoritative gate. | Nightly (03:00 UTC) and on `workflow_dispatch`. |
| `scripts/security-check.sh` | Local one-shot agent: runs the audit, the regression test, and (if `gh` is authenticated) summarises open Dependabot alerts. Exits non-zero on critical/high alerts or audit failures. | On demand via `pnpm security`. |

## 2. Dependency policy

- **Direct dependencies** are pinned to exact versions in `package.json`
  for `next`, `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss`,
  `vitest`, `@vitest/coverage-v8`. Everything else uses `^` so patch
  upgrades flow in via `pnpm update --latest`. Direct vulnerable
  packages are upgraded by raising the version in `package.json`.
- **Transitive dependencies** are patched via the `pnpm.overrides`
  block in `package.json`. Each entry pins the **vulnerable range**
  upward to a known-safe floor:

  ```json
  "pnpm": {
    "overrides": {
      "dompurify@<3.4.0": ">=3.4.0",
      "esbuild@<=0.24.2": ">=0.25.0",
      "postcss@<8.5.10": ">=8.5.10",
      "uuid@<11.1.1": ">=11.1.1",
      "happy-dom@<20.8.9": ">=20.8.9"
    }
  }
  ```

  The `package@range` form (not bare `package`) is deliberate — it lets
  pnpm leave already-safe instances alone (e.g. `esbuild@0.27.7` from
  `tsx`) while patching only the vulnerable copy.

- **Never** add a `pnpm.overrides` entry without a corresponding entry
  in `tests/unit/security.test.ts`. The test is what prevents a future
  `pnpm update` from silently regressing.

## 3. When a Dependabot alert opens

1. **Read the alert.** GitHub → Security tab → Dependabot alerts.
   Note the package, vulnerable range, and patched version.
2. **Decide direct vs transitive.** If the package is in
   `package.json` directly, bump it. If it's only in the lockfile,
   add or raise an entry in `pnpm.overrides`.
3. **Run `pnpm install`.** Confirm the lockfile resolves above the
   patched floor with `pnpm why <package>`.
4. **Add the floor.** Append a `FLOORS` entry in
   `tests/unit/security.test.ts` with the GHSA id. This is the
   regression that prevents the same advisory from re-opening if a
   later `pnpm update` walks the lockfile back below the floor.
5. **Verify.** `pnpm security` should pass cleanly. `pnpm audit`
   should report `No known vulnerabilities found`.
6. **Commit and push.** Dependabot auto-closes the alert within
   ~30 minutes once it re-scans the lockfile on `main`.

## 4. When a new advisory lands against a pinned package

The `pnpm-audit` CI job will go red on the next push or nightly run.
Treat it the same as a Dependabot alert:

- Bump the floor in `pnpm.overrides`.
- Add a `FLOORS` entry in the regression test.
- Push.

If the floor cannot be raised (e.g. a major-version-only fix that
breaks API), document the constraint here under §6 and either pin
behind a feature flag or remove the offending dependency.

## 5. Running the security agent locally

```bash
pnpm security                         # full agent (audit + test + Dependabot)
pnpm security -- --skip-dependabot    # skip the gh CLI call
pnpm security:audit                   # raw pnpm audit (moderate+)
pnpm test -- tests/unit/security.test.ts   # just the regression test
```

The agent uses `gh` to read Dependabot alerts. If `gh` is missing or
unauthenticated it logs a notice and continues — the audit and the
regression test are the authoritative gates.

## 6. Known constraints

- `vite@8.0.11` declares a peer of `esbuild@^0.27.0 || ^0.28.0` but
  resolves to `esbuild@0.25.12` in our tree. The peer is informational,
  the lockfile is safe (above the patched floor of `0.25.0`). Vitest 4
  ships with this combo intentionally.
- `pnpm why` is parsed by regex in the regression test rather than
  `--json`, because pnpm 10 emits non-JSON warnings on stderr / stdout
  ahead of the JSON body for some package layouts. The regex anchors
  the package name to a tree-drawing boundary so scoped packages with
  matching suffixes (`@tailwindcss/postcss`) are not matched as the
  bare package.

## 7. Escalation

- **Critical or high alert in production code path:** patch within 24h.
- **Moderate alert:** patch within 7d.
- **Low alert (rare on this stack):** roll into the next dependency
  bump cycle.

The cron at `.github/workflows/security.yml` runs daily at 03:00 UTC
to ensure no high/critical advisory sits unnoticed for more than a
day after disclosure.
