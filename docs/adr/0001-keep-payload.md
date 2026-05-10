# ADR-0001 — Keep Payload despite no current `/admin` user

- **Status:** Accepted
- **Date:** 2026-05-08
- **Source:** `improve-codebase-architecture` review (see [`docs/arch-review-checkpoint.md`](../arch-review-checkpoint.md))

## Context

The architecture review on 2026-05-08 surfaced that Payload CMS — mounted under [`app/(payload)/admin`](../../app/(payload)/admin), backed by Postgres via [`payload.config.ts`](../../payload.config.ts) — has **zero runtime consumers** in `app/` and `components/`. Confirmed by repo-wide search: no `getPayload(...)` outside the `(payload)` segment and the seeder. The seeder in [`scripts/seed.ts`](../../scripts/seed.ts) is the only writer; the public site reads exclusively from the static TypeScript corpus under [`content/data/*`](../../content/data).

The seeder is also lossy: it omits `news.body`, `doctors.bio/image`, dept `longform/hod`, program `longform`, the entire `leadership` corpus, and never seeds `faculty`, `locations`, `pages`, or the `navigation` global (`scripts/seed.ts` `65–187`). Any editor touching `/admin` would silently drift the site.

When asked about the realistic post-launch authoring model, the project owner described a steady state that does not justify a CMS:

- **Editing.** Nobody touches `/admin` for 1–2 years after launch. News and camps blocks may get refreshed quarterly via engineer pinch-edits. Doctor roster and OPD timings drift slowly. Phone numbers change yearly at most.
- **Photography.** A quarterly trickle (new doctors → new portraits) ideally handled without engineering involvement, but no named non-engineer editor exists today.

Strict reading of the deletion test (per the `improve-codebase-architecture` skill's `LANGUAGE.md`): if Payload is deleted, **nothing concentrates** — `lib/search.ts` already runs sync over `content/data`, every page already reads TS fixtures, `/admin` has zero non-engineer users. By that test alone, Payload is dead weight.

## Decision

**Keep Payload.** Adopt option (a) from the review: Payload becomes the sole runtime source of truth for `Doctor`, `Department`, `Program`, `News`, `Faculty`, `Location`, and `Page`. The static TypeScript corpus under `content/data/*` is reframed as a **Seed corpus** — read by `scripts/seed.ts` to populate Payload on a fresh database, never imported at runtime by `app/`, `components/`, or `lib/`.

A typed read interface — the **`ContentReader`** — is the single seam between the public site and Payload. See [`CONTEXT.md`](../../CONTEXT.md) for the architectural definition.

## Load-bearing reasoning

These are the four facts that override the deletion-test verdict. A future architecture review reading this ADR should re-litigate the decision only if one of these four facts has changed.

1. **Insurance is non-trivial.** When `/admin` does get a non-engineer user (whether in 6 months or 6 years), the editing surface, the localised field handling, and the Media workflow are already in place. Removing Payload now and reintroducing it later is a real engineering project; keeping it is a no-op.
2. **`pg_trgm` is the documented future search backend.** [`CLAUDE.md`](../../CLAUDE.md) §5.8 already names `pg_trgm` as the search migration. Postgres-backed Payload is the natural substrate; deleting Payload would commit us to in-memory search forever or to reintroducing Postgres independently.
3. **Marginal infrastructure cost is zero.** Postgres is already a dev requirement via [`docker-compose.yml`](../../docker-compose.yml); Payload is already pinned in [`package.json`](../../package.json); Railway plumbing is already in [`railway.toml`](../../railway.toml). Deleting Payload does not simplify the deployment surface in any meaningful way.
4. **Native locale handling is a free win under (a).** Payload's `locale` query parameter removes the need for the `Localized<T>` / `pick(record, locale)` pattern at runtime. Pages receive locale-resolved records; hreflang and parallel-slug callers use a `withAllLocales()` escape hatch on the `ContentReader`. This kills two of the original architecture-review candidates (the "two copy mechanisms" smell and the half-adopted `lib/href.ts`) as side effects.

## Consequences

### Positive

- One canonical read seam (`ContentReader`) instead of two parallel stores with silent drift.
- The `Localized<T>` / `pick()` pattern disappears from the runtime; survives only at seed time.
- Test surface concentrates: the `ContentReader` interface and the Locale Page Shells are unit-testable with a Fake Reader, collapsing portions of `tests/e2e/seo-header.spec.ts` into Vitest specs.
- `lib/search.ts` becomes a query against Payload (eventually `pg_trgm`), no longer welded to `content/data` imports.

### Negative

- **All reads become async.** Every server component pays the cost. Mitigated by React `cache()` per render and ISR `revalidate` per Locale Page Shell. Default revalidate window is one hour for detail and list pages; static pages do not set it.
- **Tests need a fixture story.** Vitest unit tests that previously imported `content/data` directly must instead use the `ContentReader` interface with a Fake Reader (`createMemoryReader(fixtures)` or `createReader(fakePayload)`).
- **Two type systems must agree at seed time.** `content/data/types.ts` and Payload's generated `payload-types.ts` must stay compatible. The seeder is the only place this matters; field-by-field hand-mapping there enforces the agreement.
- **Maintenance surface includes Payload upgrades, Postgres migrations, and generated-types churn.** Accepted as part of (a).

## Future review trigger

Reopen this ADR if either:

1. Twenty-four months after launch, `/admin` has had no non-engineer user **and** the Payload / Postgres upgrade burden has materialised as real engineering cost. At that point pure deletion becomes the honest move.
2. The institution hires a Hindi-fluent comms editor who actually takes over `/admin`. At that point Payload's value is confirmed and we can close future "delete Payload" suggestions without re-litigation.
