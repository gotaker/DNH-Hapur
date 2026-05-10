# CONTEXT.md — DNH Hapur

Architectural and domain language. Used by `improve-codebase-architecture`
reviews to ground proposals in the project's vocabulary; used by reviewers
to push back when a name drifts.

This file is durable session memory. Add a term when you name a deepened
module or sharpen a fuzzy distinction during design. Keep entries short;
file pointers earn their weight.

## Domain terms

- **Doctor / Department / Program / News / Page / Faculty / Location** —
  the institution's content nouns. Each lives as a Payload collection
  (`payload/collections/*.ts`) and is read at runtime through the
  **`ContentReader`**. Slugs follow the **localised slug** rule below
  for the nouns that have one.

- **Localised slug** — a slug with a per-locale variant
  (`{ en: 'cardiology', hi: 'hridya-rog-vibhag' }`). Required for
  `Department`, `Program`, and `Page`. **Not** required for `Doctor`
  or `News` (institutional convention: doctor names and news headlines
  are transliterated once, not localised). The Hindi reader on a Hindi
  page MUST land on the Hindi slug; this is enforced by URL composition
  going through the `ContentReader`'s `withAllLocales()` parallel-slug
  helper, never hand-built.

- **Hindi-first, English-equal** — Hindi is the default locale and the
  institutional voice; English is parallel and complete. Defined in
  [`PRODUCT.md`](PRODUCT.md) §Brand and enforced in
  [`i18n/routing.ts`](i18n/routing.ts) (`defaultLocale: 'hi'`). Both
  locale prefixes are always emitted (`localePrefix: 'always'`); URLs
  are unambiguous in sitemaps and `hreflang`.

## Architectural terms

- **`ContentReader`** — the typed read interface over Payload; the
  single seam between the public site and the database. The TYPE
  `ContentReader` is the architectural module; `createReader(payload)`
  is the factory; `getReader()` is the production singleton.
  Every page, the search lib, and any future content surface read
  through `ContentReader` and never call `getPayload(...)` directly.
  Returns **Reader-resolved** records by default; `withAllLocales()`
  for bilingual access. Lives in `lib/content/`. Decision recorded
  in [`docs/adr/0001-keep-payload.md`](docs/adr/0001-keep-payload.md).

- **Reader-resolved locale** — the default `ContentReader` return
  shape: records resolved to one locale (`record.name: string`),
  not bilingual maps. Replaces the legacy `Localized<T>` /
  `pick(record, locale)` pattern at runtime. Pages using this shape
  cannot accidentally render the wrong locale for a bilingual field.

- **Locale Page Shell** — the page-layer abstraction that owns
  locale priming, metadata composition, JSON-LD emission, and
  `notFound()` handling for every server page. Three generic
  Shells:
  - `localeDetailPage<T>` for `[slug]` pages
  - `localeListPage<T>` for hub / list pages
  - `localeStaticPage` for pages with no Reader fetch
  Each takes a `fetch: () => Promise<T | null>` (or `T[]`) plus a
  `body` render function. Per-noun specialisation lives at the
  page-call site as ~5-line glue. Lives in `lib/page-shells/`.

- **Seed corpus** — the TypeScript fixtures under `content/data/*`.
  Read by [`scripts/seed.ts`](scripts/seed.ts) to populate Payload
  on a fresh database. **Not imported at runtime** by `app/`,
  `components/`, or `lib/` after the cutover. Tests may consume it
  via an in-memory `ContentReader` adapter.

- **Localised record** — a record that participates in bilingual
  rendering. Appears in two shapes: **Reader-resolved** (one
  locale, the runtime default) or **bilingual map** (Seed corpus
  + `withAllLocales()` reads, used for hreflang and parallel-slug
  lookups).

## Test surface terms

- **Fake Reader** — a `ContentReader` instance built via
  `createReader(fakePayload)` or `createMemoryReader(fixtures)` for
  unit tests. Lets Locale Page Shell tests run with no Postgres,
  no Payload bootstrap, no network. The seam between Shell and
  Reader is a one-line interface (the `fetch` function passed to
  the Shell), so most Shell tests don't even need a Fake Reader —
  they pass a synthetic fetch directly.

## What this file is not

- Not a style guide. See [`PRODUCT.md`](PRODUCT.md) for voice and
  copy rules; [`DESIGN.md`](DESIGN.md) for visual tokens.
- Not a process guide. See [`CLAUDE.md`](CLAUDE.md) for operating
  protocol, test pyramid, and phase ledger.
- Not a launch runbook. See [`docs/launch-runbook.md`](docs/launch-runbook.md).
