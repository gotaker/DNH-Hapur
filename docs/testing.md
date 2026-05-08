# Testing playbook

The full regression strategy for the bilingual hospital site. The pyramid
is intentional and small — every layer earns its place by catching a
class of failure that would slip past everything else. This document
explains *what* each suite covers, *when* to extend it, and *how* to run
it cheaply.

The canonical conventions live in `claude.md` §5.4 (test methodology).
This file is the operational expansion.

## 1. Layers at a glance

| Layer | Spec / config | Command | Runs in CI / pre-merge |
|---|---|---|---|
| Type | `tsconfig.json` | `pnpm typecheck` | yes (inside `test:regression`) |
| Lint | `eslint.config.mjs` | `pnpm lint` | yes |
| Unit / component | `tests/unit/**` (Vitest 4 + happy-dom) | `pnpm test`, `pnpm test:watch` | yes |
| Security floor | `tests/unit/security.test.ts` (Vitest, shells `pnpm why`) | `pnpm test`, `pnpm security` | yes (and `.github/workflows/security.yml` on push/PR/cron) |
| E2E smoke | `tests/e2e/home.spec.ts` | `pnpm test:e2e` | yes |
| UX / UI | `tests/e2e/ui-ux.spec.ts` | `pnpm test:ui-ux` | yes (via `test:e2e`) |
| Adversarial API | `tests/e2e/adversarial.spec.ts` | `pnpm test:adversarial` | yes (via `test:e2e`) |
| SEO + headers | `tests/e2e/seo-header.spec.ts` | `pnpm test:seo-header` | yes (via `test:e2e`) |
| Accessibility | `tests/e2e/a11y.spec.ts` | `pnpm test:a11y` | yes (via `test:e2e`) |
| Visual regression | `tests/e2e/visual.spec.ts` + `*-snapshots/` | `pnpm test:e2e` | yes (via `test:e2e`) |

`pnpm test:regression` (alias `pnpm test:all`) is the pre-merge gate:

```bash
pnpm test:regression
# = pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e
```

The narrow scripts exist for tight inner-loop iteration. Use them when
you're debugging a single suite; never substitute them for the
regression aggregate before opening a PR.

## 2. Per-suite scope

### 2.1 Unit / component (`tests/unit/**`)

Vitest 4 + `@testing-library/react` + happy-dom. Reserved for:

- Pure helpers (`lib/cn.ts`, `lib/href.ts`, `lib/seo.ts`, `lib/search.ts`).
- Locale parity (`tests/unit/messages.test.ts` — adding an `en.json` key without a matching `hi.json` key fails here).
- Dependency security floors (`tests/unit/security.test.ts` — see `docs/security.md` for the full agent).
- Pure components that don't depend on `next-intl` runtime.

Do **not** mock `next-intl`. If a component depends on it, write an E2E
instead — cheaper to maintain and more honest about the locale flow.

### 2.2 E2E smoke (`home.spec.ts`)

The canary. Asserts:

- Home renders in `/hi` and `/en` with the correct `<html lang>`.
- Hindi default redirect: `/` → `/hi`, status `307|308`, `Location` matches `/hi`.
- Healthcheck (`/api/health`) returns `{ ok: true, service: 'dnh-web' }`.
- Locale switcher exposes locale-targeted `Link`s (the assertion is on
  `href`, **not** a click round-trip — the click path is handled by the
  Next router and is flaky to assert directly).

If this suite goes red, every other suite is suspect — fix it first.

### 2.3 UX / UI (`ui-ux.spec.ts`)

Behavioural surface area for the patient-on-a-phone audience:

- Skip link is the first tab stop and lands on `#main`.
- Header exposes the emergency phone, search link, and locale switcher.
- Mobile nav trigger is a `dialog` with `aria-haspopup` / `aria-expanded`.
- Contact form has labelled, required inputs and a single submit.
- Search page renders bilingual grouped results (`चिकित्सक`, `विभाग`,
  `पाठ्यक्रम`) for a Hindi query.

When you add a new interactive surface, extend this file before
shipping. New affordances without a UX test land here, not in the smoke
suite.

### 2.4 Adversarial API (`adversarial.spec.ts`)

Hostile input. Asserts:

- `/api/health` rejects unsupported methods (`POST` → `405`).
- `/api/contact` rejects malformed emails with `400 invalid email` and
  the response body never leaks `stack|trace|node_modules|payload|sql|postgres`.
- The honeypot field accepts bot-shaped submissions quietly (no error).
- `/api/search` clamps invalid locale to `hi` and bounds results to 12
  even with injection-shaped queries (`'; DROP TABLE doctors; --
  <script>alert(1)</script> हृदय`).
- `/api/search` survives an oversized query (`'हृदय'.repeat(5000)`):
  accept any of `200 | 414 | 431` **or** an `ECONNRESET`. That's the
  runtime / proxy boundary refusing the request — bounded rejection,
  not a crash. Don't tighten the assertion to a single status.

When you add a public route, extend this suite before merging.

### 2.5 SEO + headers (`seo-header.spec.ts`)

What search engines and security scanners see:

- Locale pages emit exactly one `application/ld+json` (parseable, no
  raw `<` characters) plus a single `canonical` and three `hreflang`
  alternates (`hi-IN`, `en-IN`, `x-default`).
- Public responses carry the global security headers (`X-Frame-Options`,
  `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  `Cross-Origin-Opener-Policy`).
- `/admin/*` and `/api/*` send `X-Robots-Tag: noindex, nofollow`.
  Admin status `[200, 302, 307, 308, 500]` are all acceptable — the
  header is the contract, not the body.
- `/robots.txt` and `/sitemap.xml` exist, are content-typed correctly,
  contain locale-prefixed URLs, and exclude `/admin` and `/api/`.
- `/hi/news/rss.xml` is valid RSS 2.0 and rejects `<script` tags.

When you change `next.config.mjs` headers, `lib/seo.ts`, `components/
json-ld.tsx`, `app/sitemap.ts`, `app/robots.ts`, or any
`generateMetadata`, run this suite before pushing.

### 2.6 Accessibility (`a11y.spec.ts`)

Playwright + `@axe-core/playwright`. WCAG 2.2 AA, zero violations is
the budget. Iterates over every public page in both locales on desktop
+ Pixel 7. The reference user is the elderly relative on the family's
old phone — not a tester on a Retina display.

> **Known outstanding:** `target-size` violations on `/en`,
> `/hi/contact`, `/en/contact` (desktop + mobile). Tracked as the only
> blocker on a fully green `pnpm test:regression`.

### 2.7 Visual regression (`visual.spec.ts` + `*-snapshots/`)

Screenshot diff of the home page in both locales, desktop + mobile.
Snapshots are committed under `tests/e2e/visual.spec.ts-snapshots/`.
Update intentionally with `pnpm test:e2e --update-snapshots` and review
the diff in the PR — never auto-update without eyeballing.

## 3. Local environment

Playwright runs against a `next start` server on port `3100` (see
`playwright.config.ts`). Common gotchas:

- **Port 3100 already bound:** `lsof -iTCP:3100 -sTCP:LISTEN -n -P`,
  then `kill <pid>`. The Playwright runner won't start on a busy port.
- **Stale Next dev server on 3000:** the regression suite uses 3100, so
  a parallel `pnpm dev` on 3000 is fine. If you mixed them, kill 3000
  before re-running.
- **Payload admin in seo-header tests:** `/admin` may return `500` when
  Postgres isn't seeded — that's accepted. The contract is the
  `X-Robots-Tag` header, not the body.

## 4. Adding a new test

1. Identify the cheapest layer that catches the failure (cf. §1 table).
2. Place it in the matching spec file. New suites mean new noise — only
   add a new file when the surface area is meaningfully distinct.
3. Iterate `['hi', 'en']`. Never write a single-locale test.
4. If the suite deserves a narrow command, add it to `package.json`
   `scripts` (`test:<suite>`); ensure the default `playwright test`
   still picks it up so `test:regression` covers it automatically.
5. Update `claude.md` §5.4 if the suite introduces a new convention or
   tolerance (e.g. accepting `ECONNRESET` on oversized requests).

## 5. Pre-merge checklist

```bash
pnpm test:regression
```

Plus:

- `tests/unit/messages.test.ts` is green (locale parity).
- New routes have a JSON-LD entry via `lib/seo.ts` if they're public.
- New public API routes have at least one adversarial-suite case.
- Any new chrome surface gets a UX-suite case.
- Visual snapshots are reviewed in the PR diff, not silently updated.
