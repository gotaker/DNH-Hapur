# DNH Hapur

Bilingual institutional site for **Dev Nandini Hospital and Medical College**, Hapur, Uttar Pradesh.

- Default locale: `hi` (Hindi). Secondary: `en` (English).
- Replaces the existing dnhhapur.com.
- Inspired in IA shape by Mass General Phillips, designed in a deep-blue institutional-gravitas register, not the white-and-teal healthcare cliche.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.6 (App Router, RSC, Turbopack) + React 19.2.0 — both pinned exact |
| Language | TypeScript strict |
| Styling | Tailwind CSS v4 (CSS-first `@theme` in `app/globals.css`) |
| i18n | `next-intl` v4, `[locale]` segment, default `hi`, request interception via `proxy.ts` |
| Fonts | Tiro Devanagari Hindi (display) + Hind (body), bilingual matched cuts |
| CMS (phase 5) | Payload CMS, Postgres backend |
| Tests | Vitest + happy-dom (unit), Playwright + axe-core (E2E + a11y) |
| Container | Multi-stage Dockerfile (Node 22 alpine, standalone Next output) |
| Hosting | Railway (prod), Docker Compose (local dev) |
| Pkg manager | pnpm 10 |

## Quick start

```bash
# 1. Install (Node 22+, pnpm 10+)
pnpm install

# 2. Run with Docker (recommended; matches prod environment)
pnpm docker:dev      # Next + Postgres
# → http://localhost:3000

# Or run on the host (Postgres won't be available)
pnpm dev
```

`/` redirects to `/hi`; the locale switcher in the header round-trips between `/hi` and `/en`. Healthcheck: `GET /api/health`.

## Tests

```bash
pnpm test             # Vitest unit + component
pnpm test:watch
pnpm test:e2e         # Playwright (desktop + mobile, both locales)
pnpm test:a11y        # Playwright + axe-core, WCAG 2.2 AA
pnpm test:all         # typecheck + lint + unit + e2e (pre-merge gate)
```

E2E suites and accessibility scans iterate over both locales. Visual regression snapshots are committed under `tests/e2e/*-snapshots/`. Update with `pnpm test:e2e --update-snapshots`.

## Project layout

```text
app/
  [locale]/
    layout.tsx                       html lang/dir, fonts, header, footer, NextIntlClientProvider
    page.tsx                         home: split hero, trust strip, centers, departments, doctors, news, college teaser, emergency band
    patients/
      page.tsx                       Patients section index
      departments/page.tsx           Departments list
      departments/[slug]/page.tsx    Department detail (bilingual slugs)
      doctors/page.tsx               Find a doctor (filterable)
      doctors/[slug]/page.tsx        Doctor profile (Physician JSON-LD)
      emergency/page.tsx             Print-friendly emergency page
    academics/
      page.tsx                       Academics section index
      programs/page.tsx              Programs list
      programs/[slug]/page.tsx       Program detail (bilingual slugs)
      admissions/page.tsx            Admissions calendar + table + FAQ
      faculty/page.tsx               Faculty directory
      research/page.tsx              Research overview
    news/
      page.tsx                       News list
      [slug]/page.tsx                News detail (NewsArticle JSON-LD)
      rss.xml/route.ts               Per-locale RSS feed
    about/page.tsx                   About + working principles
    contact/page.tsx                 Address, department-wise phones, inquiry form
    search/page.tsx                  Cross-corpus bilingual search
    not-found.tsx
  (payload)/                         Payload CMS admin + REST + GraphQL
    admin/[[...segments]]/
    api/[...slug]/route.ts
    api/graphql/route.ts
    api/graphql-playground/route.ts
    layout.tsx
  api/
    contact/route.ts                 Form sink (Resend in prod, console in dev)
    health/route.ts                  Liveness probe
    search/route.ts                  Search JSON
  globals.css                        Tailwind v4 + OKLCH tokens + print stylesheet
  sitemap.ts                         Per-locale sitemap
  robots.ts
components/                          site-header, site-footer, locale-switcher, mobile-nav, wordmark, ui/ primitives, json-ld, analytics, page-header
content/
  data/                              Typed bilingual content fixtures (departments, doctors, programs, news)
  messages/                          en.json, hi.json (parity-tested)
docs/                                critique-phase-3.md, imagery-and-identity.md, launch-runbook.md
i18n/                                routing, request config
lib/                                 fonts, site metadata, cn(), seo helpers, search
payload/                             Payload collection + global definitions
payload.config.ts                    Payload root config
scripts/
  seed.ts                            Seeder from content/data/* into Payload
  backup-postgres.sh                 pg_dump cron helper
tests/unit/                          Vitest specs
tests/e2e/                           Playwright specs (home, a11y, visual)
Dockerfile                           multi-stage: deps → dev / builder → runner
docker-compose.yml                   web + Postgres for local dev
railway.toml                         Railway build/deploy config (uses Dockerfile)
playwright.config.ts                 desktop-chromium + mobile (Pixel 7), both locales
vitest.config.ts                     happy-dom, alias @ → ./
```

## Design system at a glance

OKLCH tokens in `app/globals.css` `@theme`. Hard rules in `claude.md` §5.6.

- **Surface:** warm-tinted bone, never `#fff`.
- **Ink:** deep blue-black, never `#000`.
- **Brand:** committed deep hospital blue (`oklch(0.38 0.12 250)`), carries 30 to 50 percent of major surfaces.
- **Accent:** warm saffron-cream, ≤5 percent. Emphasis only.
- **Display:** Tiro Devanagari Hindi (matched Latin cut). **Body:** Hind.
- Devanagari gets +0.1 line-height under `html[lang='hi']`. Don't undo it.

## Deployment

Full launch runbook (Railway, backups, analytics, content review, DNS cutover) lives in [`docs/launch-runbook.md`](docs/launch-runbook.md).

Env vars to configure in the Railway dashboard:

```text
NEXT_PUBLIC_SITE_URL          https://dnhhapur.com
DATABASE_URI                  (auto-injected by the Railway Postgres plugin)
PAYLOAD_SECRET                (rotate per environment; openssl rand -base64 32)
RESEND_API_KEY                (transactional email)
CONTACT_TO_EMAIL              enquiry@dnhhapur.com
NEXT_PUBLIC_PLAUSIBLE_DOMAIN  dnhhapur.com (omit to disable analytics)
```

Do not commit secrets. `.env.example` is the source of truth for required keys.

### Build phase ledger

See `claude.md` §5.8.

## Contributing rules

Read `claude.md` end to end before editing. Key constraints:

- Both locales are first-class. Adding an `en.json` key without the matching `hi.json` key fails CI (`tests/unit/messages.test.ts`).
- E2E and a11y tests must iterate both locales.
- Design bans (no white/black, no icon-card grids, no reflex fonts, no glass / gradient text / em dashes) are enforced by review.
- Run `pnpm test:all` before opening a PR.
