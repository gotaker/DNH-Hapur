#!/usr/bin/env bash
# Local security agent. Mirrors the CI workflow at .github/workflows/security.yml.
#
# Runs three independent checks:
#   1. pnpm audit --audit-level=moderate (fails on moderate+ advisories)
#   2. The Vitest security-floor regression test
#   3. (Optional) Open Dependabot alerts via gh CLI, if authenticated
#
# Exit codes:
#   0 — all checks passed
#   1 — at least one critical check failed
#
# Usage:
#   pnpm security
#   pnpm security --skip-dependabot
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

SKIP_DEPENDABOT=0
for arg in "$@"; do
  case "$arg" in
    --skip-dependabot) SKIP_DEPENDABOT=1 ;;
    *)
      echo "Unknown flag: $arg" >&2
      exit 2
      ;;
  esac
done

bold() { printf '\033[1m%s\033[0m\n' "$*"; }
ok() { printf '\033[32m✓\033[0m %s\n' "$*"; }
fail() { printf '\033[31m✗\033[0m %s\n' "$*"; }
info() { printf '  %s\n' "$*"; }

EXIT=0

bold "1. pnpm audit (moderate+)"
if pnpm audit --audit-level=moderate --prod --dev; then
  ok "pnpm audit clean"
else
  fail "pnpm audit found advisories. Patch via the pnpm.overrides block in package.json or upgrade the offending direct dependency."
  EXIT=1
fi

echo

bold "2. Security-floor regression test"
if pnpm test -- tests/unit/security.test.ts >/dev/null 2>&1; then
  ok "security floors held"
else
  fail "security regression test failed. Re-run \`pnpm test -- tests/unit/security.test.ts\` for details."
  EXIT=1
fi

echo

bold "3. Open Dependabot alerts"
if [[ "$SKIP_DEPENDABOT" -eq 1 ]]; then
  info "skipped (--skip-dependabot)"
elif ! command -v gh >/dev/null; then
  info "gh CLI not installed; skipping. (brew install gh)"
elif ! gh auth status >/dev/null 2>&1; then
  info "gh CLI not authenticated; skipping. (gh auth login)"
else
  REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
  if [[ -z "$REPO" ]]; then
    info "could not determine repo (not in a GitHub remote?); skipping."
  else
    ALERTS=$(gh api "repos/${REPO}/dependabot/alerts?state=open&per_page=100" --paginate \
      -q '.[] | "[\(.security_advisory.severity | ascii_upcase)] \(.dependency.package.name) \(.security_vulnerability.vulnerable_version_range) → \(.security_advisory.ghsa_id)"' \
      2>/dev/null || true)

    if [[ -z "$ALERTS" ]]; then
      ok "no open Dependabot alerts on $REPO"
    else
      fail "open Dependabot alerts on $REPO:"
      printf '%s\n' "$ALERTS" | sed 's/^/  /'
      # Critical and high alerts fail the agent; moderate is informational.
      if printf '%s\n' "$ALERTS" | grep -E '^\[(CRITICAL|HIGH)\]' >/dev/null; then
        EXIT=1
      else
        info "(only moderate alerts; not failing the agent)"
      fi
    fi
  fi
fi

echo
if [[ "$EXIT" -eq 0 ]]; then
  bold "all security checks passed"
else
  bold "security agent reported failures"
fi

exit "$EXIT"
