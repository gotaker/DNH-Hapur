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
| CMS | Payload CMS 3.84 (mounted at `/admin`), Postgres backend, localized EN/HI fields |
| Search | In-memory bilingual fuzzy search (`lib/search.ts`) → `/api/search`, `/[locale]/search` |
| Email | Resend transactional (with dev console fallback) for the contact form |
| Analytics | Plausible (gated by `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`) |
| Tests | Vitest + happy-dom (unit), Playwright + axe-core (smoke, ux/ui, adversarial, seo-header, a11y, visual) |
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
pnpm test                # Vitest unit + component
pnpm test:watch
pnpm test:e2e            # Playwright (desktop + mobile, both locales)
pnpm test:ui-ux          # Skip link, header, mobile nav, contact form, search
pnpm test:adversarial    # Method hardening, malformed input, oversized queries
pnpm test:seo-header     # canonical, hreflang, JSON-LD, security headers, sitemap, RSS
pnpm test:a11y           # Playwright + axe-core, WCAG 2.2 AA
pnpm test:regression     # typecheck + lint + unit + e2e (pre-merge gate)
pnpm test:all            # alias of test:regression
pnpm security            # local security agent (audit + regression + Dependabot)
pnpm security:audit      # raw pnpm audit (moderate+ severity floor)
```

E2E, ux/ui, a11y, and seo-header suites iterate both locales and run on desktop + Pixel 7. Visual regression snapshots are committed under `tests/e2e/*-snapshots/`; update with `pnpm test:e2e --update-snapshots`. See [`docs/testing.md`](docs/testing.md) for the full regression playbook and [`docs/security.md`](docs/security.md) for the dependency security agent.

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
docs/                                critique-phase-3.md, imagery-and-identity.md, launch-runbook.md, testing.md, security.md
i18n/                                routing, request config
lib/                                 fonts, site metadata, cn(), seo helpers, search
payload/                             Payload collection + global definitions
payload.config.ts                    Payload root config
scripts/
  seed.ts                            Seeder from content/data/* into Payload
  backup-postgres.sh                 pg_dump cron helper
  security-check.sh                  Local security agent (pnpm security)
.github/workflows/
  security.yml                       pnpm audit + dependency-review + Dependabot summary
tests/unit/                          Vitest specs
tests/e2e/                           Playwright specs (home, a11y, visual, ui-ux, adversarial, seo-header)
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

## Security and SEO posture

Set in `next.config.mjs` and asserted by `tests/e2e/seo-header.spec.ts`:

- Global headers: `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `Cross-Origin-Opener-Policy: same-origin`.
- Private routes (`/admin/*`, `/api/*`) additionally send `X-Robots-Tag: noindex, nofollow`.
- Each locale page emits exactly one parseable `application/ld+json` script plus `canonical` and `hreflang` alternates (`hi-IN`, `en-IN`, `x-default`). Driven by `lib/seo.ts` + `components/json-ld.tsx`; never hand-write inline JSON-LD.
- `sitemap.xml`, `robots.txt`, and `/[locale]/news/rss.xml` are the canonical bot surfaces. The sitemap excludes `/admin` and `/api/`.

Dependency security is enforced by three independent layers (see [`docs/security.md`](docs/security.md)):

- `pnpm audit --audit-level=moderate` (CI + `pnpm security:audit`).
- `tests/unit/security.test.ts` — regression test that asserts every patched-version floor and the integrity of the `pnpm.overrides` block in `package.json`.
- `actions/dependency-review-action` on every PR (blocks moderate+ regressions).

## Contributing rules

Read `claude.md` end to end before editing. Key constraints:

- Both locales are first-class. Adding an `en.json` key without the matching `hi.json` key fails CI (`tests/unit/messages.test.ts`).
- E2E, ux/ui, a11y, and seo-header suites must iterate both locales.
- Design bans (no white/black, no icon-card grids, no reflex fonts, no glass / gradient text / em dashes) are enforced by review.
- Run `pnpm test:regression` before opening a PR.
