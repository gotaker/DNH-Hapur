# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 0. Operating Mode

**Default to autonomous execution. Suppress narration. Report only the final outcome.**

- Do not announce plans, intermediate steps, or what you're "about to do." No running commentary.
- Do not ask clarifying questions for routine work. Pick the most reasonable interpretation and proceed; surface ambiguities only when blocked or when the action is hard to reverse.
- End-of-turn output is a brief outcome statement: what changed, what's verified, and (only if relevant) what's next. No section headers, no bullets restating work, no preamble.
- §1 ("If unclear, stop and ask") still applies to **hard-to-reverse actions** (destructive git ops, deletions, force-pushes, sending external messages, deploys) — confirm those before acting. Routine reads, edits, builds, tests, and shell commands proceed silently.
- §4 success criteria still apply: convert the task into something verifiable, then loop until verified — just don't narrate the loop.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```
- Execute in parallel where feasible.
-Stress test convergence

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

## 5. Project — DNH Hapur

A bilingual (Hindi default, English secondary) institutional site for Dev Nandini Hospital and Medical College in Hapur, Uttar Pradesh.

### 5.1 Stack

- **Framework:** Next.js 16.2.6 (App Router, RSC, Turbopack default), React 19.2.0, TypeScript strict. Versions are pinned (no caret) in `package.json` so the team and Railway agree byte-for-byte.
- **Request interception:** `proxy.ts` at the repo root (Next 16 renamed `middleware` → `proxy`; do not reintroduce a `middleware.ts`).
- **Styling:** Tailwind CSS 4.2.4 (CSS-first via `@theme` in `app/globals.css`), no `tailwind.config.*`. OKLCH tokens; never `#fff` or `#000`. `tailwindcss` and `@tailwindcss/postcss` are pinned in lockstep.
- **i18n:** `next-intl` v4 with `[locale]` segment, default locale `hi`. Message catalogs in `content/messages/{en,hi}.json`.
- **CMS:** Payload CMS 3.84.1 embedded under `app/(payload)/admin`, Postgres backend, localized EN/HI fields. Collections + globals live in `payload/`. Seed via `pnpm seed`.
- **Search:** in-memory bilingual fuzzy search (`lib/search.ts`) exposed via `/api/search` and `/[locale]/search`. Postgres `pg_trgm` is the future migration path; the in-memory implementation is bounded to 12 hits per query and is the contract enforced by the adversarial suite.
- **Email:** Resend for transactional contact form delivery (`/api/contact`). Falls back to a console log in dev so the form is still testable without `RESEND_API_KEY`.
- **Analytics:** Plausible (`components/analytics.tsx`), gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Omit the env var to disable the script entirely — no cookies, no banner needed.
- **Fonts:** Spectral (display, light/300) + Helvetica Neue / system stack (body), mirroring Mass General Brigham's institutional register. Tiro Devanagari Hindi and Hind are loaded as Devanagari fallbacks via the `--font-display` / `--font-sans` cascade so Hindi glyphs render consistently. Latin loads via `next/font/google` in `lib/fonts.ts`; Helvetica Neue is OS-provided (Apple) with Helvetica / Arial as cross-platform fallbacks.
- **Pkg manager:** `pnpm@10` (matches `packageManager` in `package.json`).
- **Path aliases:** `@/*` → repo root, `@payload-config` → `./payload.config.ts` (declared in `tsconfig.json`). Prefer aliased imports over deep relative paths for cross-cutting modules (`@/lib/...`, `@/components/...`, `@/i18n/...`).

### 5.2 Local development — Docker

Docker is the source of truth for local dev so behaviour matches Railway.

```bash
pnpm install            # only needed if you also run things on the host
pnpm docker:dev         # docker compose up --build
pnpm docker:down        # tear down + remove volumes
```

The `web` service runs the `dev` Dockerfile target (Turbopack HMR via bind mount); the `db` service is Postgres 17 backing the Payload CMS at `/admin`.

Host-side scripts (no Docker) still work for quick iteration:

```bash
pnpm dev
pnpm test
pnpm test:e2e
```

### 5.3 Production — Railway

- Same `Dockerfile` (the `runner` stage) is used for prod. Don't add a Railway-specific build path.
- `railway.toml` declares `builder = "DOCKERFILE"` and a `/api/health` healthcheck.
- Env vars (set in the Railway dashboard, mirrored in `.env.example`):
  - `NEXT_PUBLIC_SITE_URL`
  - `DATABASE_URI` (auto-injected by the Railway Postgres plugin)
  - `PAYLOAD_SECRET` (rotated per environment)
  - `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (transactional email)
  - `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` (omit to disable analytics; no banner needed either way)
- **Never** hardcode environment-specific values. They live in env vars or Payload globals.
- Full launch playbook (backups, content review, DNS cutover, rollback): `docs/launch-runbook.md`.

### 5.4 Test methodology

The pyramid is intentional and small. Add tests at the layer that catches the failure cheapest.

| Layer | Tool | Scope | When to add |
|---|---|---|---|
| Type | `tsc --noEmit` | Whole repo | Always — `pnpm typecheck` runs first inside `test:regression`. |
| Lint | `eslint .` | Whole repo | Always — caught at PR time. |
| Unit | Vitest 4 + happy-dom | Pure functions, locale parity, formatters | New utility, new lib, new pure component. |
| Component | Vitest + @testing-library/react | Components in isolation | When a component has logic worth testing without the network. |
| E2E (smoke) | Playwright (`tests/e2e/home.spec.ts`) | Cross-locale flows, real navigation, healthcheck, root redirect | Every new user-facing flow gets one happy-path E2E. |
| UX/UI | Playwright (`tests/e2e/ui-ux.spec.ts`) | Skip link, header controls, mobile nav semantics, contact form, search results | New interactive surface or affordance. |
| Adversarial API | Playwright (`tests/e2e/adversarial.spec.ts`) | Method hardening, malformed input, honeypot, oversized + injection-shaped queries | Any new public API route, any auth/validation change. |
| SEO + headers | Playwright (`tests/e2e/seo-header.spec.ts`) | Canonical, hreflang, JSON-LD parseability, security headers, `X-Robots-Tag`, robots.txt, sitemap.xml, RSS | Any change to metadata, headers, or routing surface that search bots see. |
| Accessibility | Playwright + `@axe-core/playwright` (`tests/e2e/a11y.spec.ts`) | Every public page in both locales, desktop + mobile | New top-level route. WCAG 2.2 AA — zero violations is the budget. |
| Visual regression | Playwright screenshots (`tests/e2e/visual.spec.ts`) | Home page in both locales (extend per phase) | Before locking a design pass; update with `--update-snapshots`. |
| Security floor | Vitest (`tests/unit/security.test.ts`) | Every patched-version floor + `pnpm.overrides` integrity | Whenever a new advisory lands. See §5.6.2. |

Conventions:

- E2E, ux/ui, and a11y suites must run in **both** locales. Iterate `['hi', 'en']`.
- Mobile is non-negotiable: the Playwright config runs on `Pixel 7` alongside desktop. Don't ship desktop-only tests.
- Do not mock i18n in unit tests; if a component depends on `next-intl`, write it as an E2E test instead. Cheaper and more honest.
- Tests live under `tests/unit/**` (Vitest) and `tests/e2e/**` (Playwright). No co-located tests in `app/` or `components/` — keeps RSC bundles clean.
- Snapshots are committed (`tests/e2e/*-snapshots/`). Reports and run artifacts (`playwright-report/`, `test-results/`, `coverage/`, `graphify-out/`) are gitignored — anything generated by tools or skills goes here, not into the repo.
- Locale switcher must be a real `Link` (from `i18n/routing`), not a `router.replace` button. The UX test asserts the `href` attribute, not a click round-trip — keep the test declarative.
- `pnpm test:regression` (alias `pnpm test:all`) is the pre-merge gate: `typecheck && lint && vitest && playwright`. Targeted scripts (`test:ui-ux`, `test:adversarial`, `test:seo-header`, `test:a11y`) exist for narrow loops.
- Vitest is pinned to `4.1.5` and requires `vite@^8` plus `@vitejs/plugin-react@^6` as direct devDeps to satisfy its `./module-runner` / `./internal` subpath exports. Don't "clean up" the explicit `vite` entry — Vitest 4 won't resolve without it.
- The adversarial oversized-query case must accept `200 | 414 | 431` **and** an `ECONNRESET`. That's the runtime/proxy boundary refusing the request — bounded rejection, not a server crash. Don't tighten the assertion.
- When adding a new E2E spec, add it to the `scripts` block in `package.json` if it deserves a narrow command, and ensure the default `playwright test` (run via `test:e2e` / `test:regression`) still picks it up.

Running a single test:

- Single Vitest file: `pnpm test tests/unit/messages.test.ts`
- Single Vitest by name: `pnpm test -t "locale parity"`
- Single Playwright spec: `pnpm exec playwright test tests/e2e/home.spec.ts`
- Filter Playwright by title: append `-g "redirects"`; restrict device project: `--project="Mobile Chrome"`
- Update visual snapshots after a deliberate design change: `pnpm test:e2e --update-snapshots`

### 5.5 Bilingual rules

- Both locales are first-class. Every CMS field with copy is localised; every component receives translated strings via `useTranslations` or `getTranslations`.
- Devanagari needs more leading. Globals bump line-height under `html[lang='hi']`. Don't undo this in component styles.
- Phone numbers, lab values, and prices use Latin digits in both locales (Indian institutional convention).
- Slugs are localised through Payload (`/en/patients/departments/cardiology` ↔ `/hi/patients/departments/hridya-rog-vibhag`). Don't introduce English-only slugs in the Hindi tree.
- `hreflang` and JSON-LD are emitted per route in `generateMetadata`.
- Adding a key to `en.json` requires the same key in `hi.json`. The `tests/unit/messages.test.ts` parity test enforces this.

### 5.6 Design system rules (impeccable register)

The design lives in `app/globals.css` `@theme` and is enforced by review, not by lint. Read `dnh_hapur_bilingual_rebuild_50f5d78b.plan.md` for the full shape brief, and `DESIGN.md` for the canonical explanation of every token.

Hard bans on this codebase:

- No `#fff` / `#000`. Use `oklch(...)` tokens.
- No icon-heading-text card grids. Build typographic indices, numbered lists, longform content blocks.
- No gradient text, no glassmorphism, no side-stripe borders, no rounded-corner icons above headings.
- No reflex fonts: Inter, DM Sans, Plus Jakarta, Outfit, Plex, Fraunces, Playfair, Cormorant. Display is Spectral (Latin) with Tiro Devanagari Hindi for Devanagari; body is Helvetica Neue / Helvetica / Arial system stack with Hind for Devanagari. Don't reintroduce Tiro/Hind as the primary Latin face — they remain only as Devanagari fallbacks.
- No em dashes in copy.
- No mocking healthcare clichés (white + teal + smiling stock doctor). The committed colour is the deep hospital blue defined in `--color-brand`.

### 5.6.1 Security and SEO posture

Set in `next.config.mjs` `headers()` and asserted by `tests/e2e/seo-header.spec.ts`:

- Global response headers on every route: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`.
- Private routes (`/admin/*`, `/api/*`) additionally send `X-Robots-Tag: noindex, nofollow`. The Payload admin and every API route are out of the search index by default; don't override per-route.
- Every public locale page emits exactly one `application/ld+json` script (HTML-safe, parseable). `lib/seo.ts` and `components/json-ld.tsx` are the only sources — don't hand-write `<script type="application/ld+json">` inline in a page.
- Locale pages emit `link[rel=canonical]` plus `hreflang` alternates for `hi-IN`, `en-IN`, `x-default`. Driven by `lib/seo.ts`; new routes pick this up by calling its helpers from `generateMetadata`.
- `app/sitemap.ts` and `app/robots.ts` are the canonical robots/sitemap surfaces. Sitemap must not contain `/admin` or `/api/`. RSS lives at `/[locale]/news/rss.xml`.

### 5.6.2 Dependency security agent

Three layers, documented in full in `docs/security.md`:

1. **`pnpm audit --audit-level=moderate`** — fails on any moderate, high, or critical advisory in either tree. Run via `pnpm security:audit` locally; `.github/workflows/security.yml` runs it on every push, PR, and nightly at 03:00 UTC.
2. **`tests/unit/security.test.ts`** — regression test that asserts every patched-version floor (`happy-dom>=20.8.9`, `dompurify>=3.4.0`, `esbuild>=0.25.0`, `postcss>=8.5.10`, `uuid>=11.1.1`) and that the `pnpm.overrides` block in `package.json` still pins each transitive away from its known-vulnerable range. **Adding a floor here is the canonical fix; never `pnpm update` without it.**
3. **`actions/dependency-review-action`** — PR-only, blocks merge if the diff introduces a dependency at moderate severity or worse that wasn't already on `main`.

Local one-shot agent: `pnpm security` (audit + regression + Dependabot summary via `gh`). Treat critical/high Dependabot alerts as a 24-hour fix window, moderate as 7-day. Don't disable the agent to land a patch; raise the floor.

When a new advisory lands:

1. Bump the direct dep in `package.json`, **or** add/raise an entry in `pnpm.overrides` for transitive deps.
2. `pnpm install` and verify with `pnpm why <pkg>`.
3. Append a `FLOORS` entry to `tests/unit/security.test.ts` with the GHSA id.
4. Run `pnpm security` to confirm clean. Push — Dependabot auto-closes within ~30 min.

### 5.7 Update protocol for this file

This file is durable session memory. Update it when:

- A new dependency or tool joins the stack.
- A test layer or convention changes.
- A new bilingual or design rule is decided.
- The hosting / deployment shape changes.

Keep updates surgical — append to the relevant subsection, do not rewrite §0–§4. Date the change inline (e.g. "added 2026-05") only when reversibility matters.

### 5.8 Build phases (ledger)

| Phase | Status | Notes |
|---|---|---|
| 0. Bootstrap | done | Next 16.2.6 + React 19.2.0 (pinned) + TS strict + Tailwind 4.2.4 + next-intl v4 + Docker + Railway + test pyramid. |
| 1. Design system | done | OKLCH tokens, fonts, header / footer / locale switcher, container + eyebrow + rule utilities in place. UI primitives in `components/ui/` (Button, Input, Label, Sheet, Dialog, Accordion) are hand-restyled around Radix — they are not a stock shadcn install. |
| 2. Home | done | Hero, trust strip, departments index, Centers of Excellence, doctors marquee, news, college teaser, emergency band in both locales. Hero photographic slot is a deliberate Unsplash placeholder with a documented brief in `docs/imagery-and-identity.md`; real photography replaces it post-launch. |
| 3. Impeccable critique | done | `docs/critique-phase-3.md` records the verdict. PASS with photography swap deferred to phase 6. |
| 4. Inner templates | done | Department / Doctor / Program / Admissions / Find-a-doctor / Emergency / About / News list + detail / Search / Contact all live. Bilingual slugs, JSON-LD per page type. |
| 5. Payload CMS | done | Mounted under `app/(payload)/admin`, Postgres backend, localized EN/HI fields. Collections: `users`, `media`, `doctors`, `departments`, `programs`, `faculty`, `news`, `locations`, `pages`. Globals: `settings`, `navigation`. Seeder in `scripts/seed.ts`. Architectural decision to keep Payload as the runtime read source captured in `docs/adr/0001-keep-payload.md`; the ContentReader cutover (phase 10) is the next step. |
| 6. Imagery + identity | done | Photography brief, wordmark variants, iconography rules captured in `docs/imagery-and-identity.md`. Real photography is the post-launch swap; the placeholder substrate is intentional. |
| 7. Search + forms | done | In-memory bilingual fuzzy search (`lib/search.ts` + `/api/search` + `/[locale]/search`). Contact form with honeypot via `/api/contact` + Resend (console fallback in dev). Print stylesheet on emergency page. WhatsApp click-to-chat in chrome. |
| 8. Perf / a11y / SEO | done | JSON-LD (`Hospital`, `EducationalOrganization`, `Physician`, `MedicalSpecialty`, `NewsArticle`), hreflang alternates, `app/sitemap.ts`, `app/robots.ts`, RSS, hardened security headers, `X-Robots-Tag` on private routes, hero converted to `next/image` for LCP. Plausible analytics gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. |
| 9. Launch | ready | Runbook in `docs/launch-runbook.md`. Postgres backup script (`scripts/backup-postgres.sh`). DNS cutover and content review require institutional sign-off before triggering. |
| 10. Reader cutover | planned | All `app/`, `components/`, and `lib/` reads go through `ContentReader` (typed interface over Payload, factory + production singleton, locale-resolved by default with `withAllLocales()` escape hatch). `content/data/*` is reframed as the **Seed corpus** — read only by `scripts/seed.ts`, never imported at runtime. Three generic Locale Page Shells (`localeDetailPage`, `localeListPage`, `localeStaticPage`) consume `ContentReader` via a `fetch` function seam. Architectural definitions in `CONTEXT.md`; load-bearing reasoning in `docs/adr/0001-keep-payload.md`. Rollout is incremental, Doctors first. As side effects, the legacy `Localized<T>` / `pick(record, locale)` pattern leaves the runtime, and `lib/href.ts` becomes redundant. |

Outstanding before merge to main can ship as a release tag:

- Axe `target-size` violations on `/en`, `/hi/contact`, `/en/contact` (desktop + mobile). Tracked separately; `pnpm test:regression` will fail until they're fixed.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
