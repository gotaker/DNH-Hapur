# Arch review checkpoint

> Working note for the `improve-codebase-architecture` review on 2026-05-08.
> Step 3 (grilling loop) landed for candidates #1 and #2 — see **Resolution**
> below. Candidates #3 and #4 dissolved as side effects of the same decisions.
> Candidates #5 and #6 remain open. Delete this file once #5 / #6 are also
> resolved or formally deferred.

## Resolution (2026-05-08)

The grilling loop on candidates #1 (Content Reader) and #2 (Locale Page
Shell) landed a four-decision spine. Side-effect docs:

- [`docs/adr/0001-keep-payload.md`](adr/0001-keep-payload.md) — captures the load-bearing reasoning that overrides the deletion-test verdict on Payload.
- [`CONTEXT.md`](../CONTEXT.md) — names `ContentReader`, `Reader-resolved locale`, `Locale Page Shell`, `Seed corpus`, `Localised record`, `Fake Reader`.
- [`CLAUDE.md`](../CLAUDE.md) §5.8 — ledger updated with the cutover.

### The spine

1. **Payload wins everywhere (option `a`).** All Payload collections wake up; `content/data/*` becomes the **Seed corpus** read only by `scripts/seed.ts`. Reasoning in the ADR.
2. **`ContentReader` is a typed interface; locale-resolved by default; `withAllLocales()` escape hatch** for hreflang and parallel-slug callers. The TYPE is the architectural module.
3. **3 generic Locale Page Shells**: `localeDetailPage`, `localeListPage`, `localeStaticPage`. Closed set; per-noun specialisation lives at the page-call site as ~5-line glue.
4. **Hybrid factory + singleton + Shell-takes-fetch-fn (option `3c`).** `createReader(payload): ContentReader` is the factory; `getReader()` is the production singleton; Shells take a `fetch: () => Promise<T | null>` function rather than a Reader instance. The seam between Shell and Reader is a one-line interface.

### Cascading consequences

- **Candidate #3** (two copy mechanisms / kill inline `locale === 'hi'` ternaries) — **resolved** as side effect of `Reader-resolved locale`. Locale-resolved records remove the ergonomic excuse for the `t = (en, hi) => ...` helpers; the `Localized<T>` / `pick()` pattern survives only at seed time.
- **Candidate #4** (`lib/href.ts` half-adopted seam) — **resolved** as side effect of `withAllLocales()`. The Reader's parallel-slug helper makes URL construction with the right locale slug a Reader concern; the standalone `lib/href.ts` becomes redundant.
- **Candidate #5** (Navigation Map) — open. Independent of #1 / #2; can be picked up later.
- **Candidate #6** (Section header pattern) — flagged shallow; not pursuing unless re-evaluated.

### Small decisions (deferred to implementation)

The grilling loop also landed defaults on four small decisions, captured here so the implementation phase doesn't re-litigate:

1. **`generateStaticParams`** — page-side, calling `(await getReader()).listSlugs(locale)`. Not buried in the Shell; Next prefers it that way.
2. **Caching** — Reader methods wrapped in React `cache()`; `localeDetailPage` and `localeListPage` default to `revalidate: 3600`; `localeStaticPage` doesn't set it. Pages can override per-route.
3. **`content/data/*` fate** — stays as Seed corpus. Deleted from runtime imports across `app/`, `components/`, `lib/`. Tests use it via `createMemoryReader(fixtures)` or `createReader(fakePayload)`.
4. **Rollout phasing** — incremental. ContentReader + 3 Shells built first. Doctors cuts over first (highest churn), then News, then Departments / Programs / Faculty / Pages / Locations together. `Navigation` global is its own follow-up bound up with candidate #5.

### What was explicitly not produced today

- **No code.** This is a shaped seam + captured decisions, not an implementation.
- **No multi-PR plan.** That is the `writing-plans` skill's territory; ask separately when ready to start.

---

## Skill + flow state (historical)

- Skill: `improve-codebase-architecture`. Step 1 (Explore) and Step 2 (Present candidates) completed during the initial pass; Step 3 (Grilling loop) completed for candidates #1 and #2.
- One round of three parallel explorer subagents (dynamic pages, API + Payload, components + tests) was interrupted; the second round (in `quick` mode) returned and informed candidate ranking. Subagent reports inlined into the conversation transcript, not committed.

## Files already read (do not re-read on resume)

- Routing + i18n: `proxy.ts`, `i18n/routing.ts`, `i18n/request.ts`.
- Layout + home: `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`.
- Lib: every file under `lib/` (`cn.ts`, `fonts.ts`, `href.ts`, `search.ts`, `seo.ts`, `site.ts`).
- Content corpus: `content/data/types.ts`, `content/data/doctors.ts`, `content/data/departments.ts`.
- Payload: `payload.config.ts`.
- Product context: `PRODUCT.md`, `CLAUDE.md`, repo root listing, `docs/` listing.

## Signals already detected

Five smells surfaced from the foundation read alone. Each is a candidate for a deepening opportunity in step 2 — the deeper subagent passes are needed to confirm scope and locate every caller.

1. **Per-page boilerplate chain.** Every locale route opens with the same five-line ritual: `await params` → `setRequestLocale(locale)` → `getTranslations(...)` → `generateMetadata` calling `hreflangAlternates({ en: '...', hi: '...' })` → page body wrapped in `<JsonLd data={...} />`. Visible in [`app/[locale]/page.tsx`](../app/[locale]/page.tsx). The shape is copy-pasted, not extracted; the page is the seam, but the seam doesn't exist.

2. **Two copy mechanisms in one render.** [`app/[locale]/page.tsx`](../app/[locale]/page.tsx) uses `next-intl` (`getTranslations('home')`) for the hero and headers, then drops to inline `locale === 'hi' ? '...' : '...'` ternaries for stat-strip labels (lines ~67–80), the academics paragraph (~265–267), the academics stat strip (~289–305), and the CTA labels (~272, 282, 290–305). Maintainers now have to know which mechanism a given string lives in. The `messages.json` parity test (`tests/unit/messages.test.ts`) cannot catch the inline copy.

3. **Two stores for the same nouns.** [`content/data/`](../content/data) holds `doctors`, `departments`, `programs`, `news`, `leadership` as TypeScript modules. [`payload/collections/`](../payload/collections) defines the same nouns as Payload collections. The public site reads only `content/data`; Payload is wired (admin route, Postgres adapter, seeder at [`scripts/seed.ts`](../scripts/seed.ts)) but not consumed. The seeder writes one direction (TS → Payload), so the moment an editor changes anything in `/admin`, the site silently drifts. There is no read-side "content reader" abstraction that hides this.

4. **`lib/search.ts` is welded to the store.** The module imports `departments`, `doctors`, `programs` from `content/data/*` directly. The CLAUDE.md ledger names `pg_trgm` as the future migration. Today, switching the search source means editing the search algorithm — the seam between "what's searchable" and "how scoring works" doesn't exist.

5. **`lib/href.ts` is a hypothetical seam.** [`lib/href.ts`](../lib/href.ts) exports `localizedHref(prefix, slug, locale)` — but [`app/[locale]/page.tsx`](../app/[locale]/page.tsx) line 196 builds `/patients/departments/${d.slug.en}` by hand (and only emits the English slug, defeating the whole bilingual-slug discipline). One adapter, zero callers — a pass-through waiting to be either adopted or deleted.

## Open exploration questions

The three subagent prompts that didn't return. Re-dispatched on resume in `quick` mode so they actually finish.

### A. Dynamic pages (target: `app/[locale]/**/*`)

For every route file:

1. Data sources pulled (`content/data/*`, payload, `lib/*`).
2. Metadata helpers used (`generateMetadata` shape, `lib/seo.ts` calls, `<JsonLd>` use).
3. Repeated boilerplate (the per-page ritual from signal 1).
4. Duplicated JSX (doctor card, department card, page header, breadcrumbs).
5. Where locale-aware slug resolution is inline vs via `lib/href.ts`.
6. Where `pick(...)` is called repeatedly on the same record.
7. Where `notFound()` fires and what triggers it.
8. Inline `locale === 'hi' ? ...` ternaries used for copy.
9. Hand-built `/${locale}/...` paths that bypass `Link` from `i18n/routing`.

### B. API routes + Payload + content/data seam

1. Validation in `app/api/{contact,search,health}/route.ts` (Zod? hand-rolled?).
2. Whether the contact route's request/response/error shape is documented or implicit.
3. Per-route headers (security, `X-Robots-Tag`, content-type, CORS).
4. Each Payload collection's shape — localised fields, slug fields, hooks, access control.
5. How `scripts/seed.ts` maps `content/data` → Payload, and how it would silently drift.
6. Whether `lib/search.ts` knows about Payload at all (current answer: no — confirm no plans embedded in code).
7. Where `content/data` and Payload duplicate vs diverge, who is source of truth today.
8. Whether any Payload generated type is referenced from `app/` or `lib/`, or only from the seeder.
9. `globals` (settings, navigation) — fields, locales, whether the public site reads them yet.

### C. Components + tests

1. Components with props vs components consuming `useTranslations` directly.
2. Page-level chrome duplicated between pages instead of going through `components/page-header.tsx`.
3. The repeated section-header pattern (`container-wide` + `py-section` + eyebrow + h2 + paragraph + view-all link) — count occurrences.
4. `locale-switcher.tsx`: real `Link` from `i18n/routing` (per CLAUDE.md), confirmed.
5. `mobile-nav.tsx` vs `site-header.tsx`: shared nav data or duplicated link list.
6. `components/ui/*`: confirmed hand-restyled around Radix (CLAUDE.md says so). Note any place this assumption breaks.
7. Tests: list every spec with one-line summary.
8. Tests: behaviour tested at multiple layers (e.g. contact API as unit AND adversarial e2e).
9. Tests: which spec uses a module's public interface as its test surface vs reaches into implementation.
10. Tests: which import `content/data` directly (bypassing any `lib/*` abstraction).
11. Tests: repeated fixture/setup across files.

## Glossary placeholders (provisional)

These are the architectural names I expect to land on. They're not committed — they exist so the next pass uses consistent language with this checkpoint. Promote to a real `CONTEXT.md` only after a candidate is picked and the user confirms the term.

- **Content reader** — the missing module that owns reads of `doctors / departments / programs / news / leadership`, hiding whether the bytes came from `content/data/*`, Payload, or a future cache. Today, every consumer (page, search, seeder) reaches into `content/data/*` directly. Two adapters (TS modules + Payload collections) exist; no seam unifies them.
- **Page shell** — the missing module that owns the per-page ritual (locale resolution, request-locale priming, metadata + hreflang assembly, JSON-LD slot, breadcrumb assembly). Today the ritual is open-coded in every `page.tsx`.
- **Localised slug** — a `Localized<string>` slug (the existing type in `content/data/types.ts`) plus the URL it produces. `lib/href.ts` is a hypothetical seam for this; not adopted.
- **Search corpus** — the bilingual record-set `lib/search.ts` scores against. Currently fused with the algorithm; could be a parameter.
- **Copy strategy** — the rule deciding whether a string lives in `messages/{en,hi}.json` or in an inline ternary. Today there isn't one.

## Resume checklist (historical — superseded by Resolution above)

1. ~~Re-dispatch the three explorer subagents (A, B, C above) in `quick` mode, in parallel.~~ Done.
2. ~~Merge their findings with signals 1–5.~~ Done.
3. ~~Present the numbered deepening-opportunity list per the skill's step 2 format (Files / Problem / Solution / Benefits, vocabulary above).~~ Done.
4. ~~Wait for the user to pick one before proposing interfaces.~~ Done; #1 + #2 picked together.

## Open candidates for a future session

- **#5 — Navigation Map.** Three nav lists (`site-header.tsx` `primary`, `mobile-nav.tsx` props, `site-footer.tsx` `sections`) for the same destinations; `payload/globals/navigation.ts` defined but unread. Not addressed in the current spine; a future review can pick it up. The cutover (decision #4 above) deliberately defers the `Navigation` global migration so it can land alongside #5 if pursued.
- **#6 — Section header pattern.** Already flagged as probably shallow in the original candidate list. Not re-evaluated. Default position: do not extract a `<SectionHeader>` component unless `PageHeader` itself is being reshaped.
