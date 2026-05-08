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
- **Styling:** Tailwind CSS v4 (CSS-first via `@theme` in `app/globals.css`), no `tailwind.config.*`. OKLCH tokens; never `#fff` or `#000`.
- **i18n:** `next-intl` v4 with `[locale]` segment, default locale `hi`. Message catalogs in `content/messages/{en,hi}.json`.
- **CMS (phase 5):** Payload CMS embedded under `app/(payload)/admin`, Postgres backend.
- **Fonts:** Tiro Devanagari Hindi (display) + Hind (body), both bilingual matched cuts. Loaded via `next/font/google` in `lib/fonts.ts`.
- **Pkg manager:** `pnpm@10` (matches `packageManager` in `package.json`).

### 5.2 Local development — Docker

Docker is the source of truth for local dev so behaviour matches Railway.

```bash
pnpm install            # only needed if you also run things on the host
pnpm docker:dev         # docker compose up --build
pnpm docker:down        # tear down + remove volumes
```

The `web` service runs the `dev` Dockerfile target (Turbopack HMR via bind mount); the `db` service is Postgres 17, ready for Payload in phase 5.

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
  - `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (phase 7)
- **Never** hardcode environment-specific values. They live in env vars or Payload globals.

### 5.4 Test methodology

The pyramid is intentional and small. Add tests at the layer that catches the failure cheapest.

| Layer | Tool | Scope | When to add |
|---|---|---|---|
| Type | `tsc --noEmit` | Whole repo | Always — `pnpm typecheck` is part of `test:all`. |
| Lint | `next lint` | Whole repo | Always — caught at PR time. |
| Unit | Vitest + happy-dom | Pure functions, locale parity, formatters | New utility, new lib, new pure component. |
| Component | Vitest + @testing-library/react | Components in isolation | When a component has logic worth testing without the network. |
| E2E | Playwright | Cross-locale flows, real navigation | Every new user-facing flow gets one happy-path E2E. |
| Accessibility | Playwright + `@axe-core/playwright` | Every public page in both locales | New top-level route. WCAG 2.2 AA — zero violations is the budget. |
| Visual regression | Playwright screenshots | Home page in both locales (extend per phase) | Before locking a design pass; update with `--update-snapshots`. |

Conventions:

- E2E and a11y suites must run in **both** locales. Iterate `['hi', 'en']`.
- Mobile is non-negotiable: the Playwright config runs on `Pixel 7` alongside desktop. Don't ship desktop-only tests.
- Do not mock i18n in unit tests; if a component depends on `next-intl`, write it as an E2E test instead. Cheaper and more honest.
- Tests live under `tests/unit/**` (Vitest) and `tests/e2e/**` (Playwright). No co-located tests in `app/` or `components/` — keeps RSC bundles clean.
- Snapshots are committed (`tests/e2e/*-snapshots/`). Reports and run artifacts (`playwright-report/`, `test-results/`, `coverage/`) are gitignored.
- `pnpm test:all` is the pre-merge gate: typecheck + lint + unit + e2e.

### 5.5 Bilingual rules

- Both locales are first-class. Every CMS field with copy is localised; every component receives translated strings via `useTranslations` or `getTranslations`.
- Devanagari needs more leading. Globals bump line-height under `html[lang='hi']`. Don't undo this in component styles.
- Phone numbers, lab values, and prices use Latin digits in both locales (Indian institutional convention).
- Slugs are localised through Payload (`/en/patients/departments/cardiology` ↔ `/hi/patients/departments/hridya-rog-vibhag`). Don't introduce English-only slugs in the Hindi tree.
- `hreflang` and JSON-LD are emitted per route in `generateMetadata`.
- Adding a key to `en.json` requires the same key in `hi.json`. The `tests/unit/messages.test.ts` parity test enforces this.

### 5.6 Design system rules (impeccable register)

The design lives in `app/globals.css` `@theme` and is enforced by review, not by lint. Read `dnh_hapur_bilingual_rebuild_50f5d78b.plan.md` for the full shape brief.

Hard bans on this codebase:

- No `#fff` / `#000`. Use `oklch(...)` tokens.
- No icon-heading-text card grids. Build typographic indices, numbered lists, longform content blocks.
- No gradient text, no glassmorphism, no side-stripe borders, no rounded-corner icons above headings.
- No reflex fonts: Inter, DM Sans, Plus Jakarta, Outfit, Plex, Fraunces, Playfair, Cormorant. Fonts are Tiro + Hind unless deliberately changed.
- No em dashes in copy.
- No mocking healthcare clichés (white + teal + smiling stock doctor). The committed colour is the deep hospital blue defined in `--color-brand`.

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
| 0. Bootstrap | done | Next 16.2.6 + React 19.2.0 (pinned) + TS strict + Tailwind v4 + next-intl v4 + Docker + Railway + test pyramid. |
| 1. Design system | partial | OKLCH tokens, fonts, header / footer / locale switcher in place. shadcn primitives not yet added. |
| 2. Home | partial | Hero, trust strip, departments index, emergency band done in both locales. Still placeholder imagery. |
| 3. Impeccable critique | pending | Run after phase 2 polish. |
| 4. Inner templates | pending | Department / Doctor / Program / Admissions / Find-a-doctor / Emergency / About / News. |
| 5. Payload CMS | pending | Postgres ready in compose. Mount `/admin`. |
| 6. Real imagery + identity | pending | |
| 7. Search + forms | pending | pg_trgm + Resend. |
| 8. Perf / a11y / SEO | pending | |
| 9. Launch | pending | |

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
