# ContentReader + Locale Page Shells (infrastructure) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the architectural infrastructure for the Reader cutover — a typed `ContentReader` interface (Doctor surface only in this plan), in-memory and Payload-backed implementations, a production singleton, and three generic Locale Page Shells. No consumer changes; existing pages keep importing from `content/data`. Per-noun cutover plans (Doctors first) follow this one.

**Architecture:** `ContentReader` is a TypeScript interface defined as a pure type. `createReader(payload)` is the factory; `getReader()` is the production singleton (lazy-initialised, cached). `createMemoryReader(fixtures)` is the in-memory adapter for unit tests. The three shells (`localeDetailPage`, `localeListPage`, `localeStaticPage`) are generic helpers parameterised on a `fetch` function and a `body` render function — they own locale priming, JSON-LD emission, and `notFound()`. The Shell-Reader seam is the `fetch` function (one-line interface), so Shells are testable with synthetic fetch fakes (no Reader, no Payload, no Postgres).

**Tech Stack:** TypeScript 5.7, Payload 3.84, Next 16 RSC, React 19, Vitest 4.1.5 + happy-dom, `react-dom/server` for shell-render assertions, next-intl 4.

**Source documents:**
- [`CONTEXT.md`](../../CONTEXT.md) — architectural terms (`ContentReader`, `Locale Page Shell`, `Reader-resolved locale`, `Seed corpus`, `Fake Reader`, `Localised record`).
- [`docs/adr/0001-keep-payload.md`](../adr/0001-keep-payload.md) — why Payload stays as the runtime read source.
- [`docs/arch-review-checkpoint.md`](../arch-review-checkpoint.md) — Resolution section with the four-decision spine.

**Out of scope for this plan (covered by later plans):**
- Cutting any existing page over to `ContentReader`. All `app/[locale]/**` keep their current `content/data/*` imports.
- Department, Program, News, Faculty, Page, Location surfaces of `ContentReader`. Plan 1 ships Doctor-only.
- Generating `payload-types.ts`. Plan 1 uses hand-rolled types in `lib/content/types.ts`; per-noun cutover plans add the generated-types layer once each cutover lands.
- Changes to the seeder, search lib, or any e2e tests.

---

## File structure

**Create:**
- `lib/content/types.ts` — Reader-resolved + bilingual record types for Doctor (and the supporting `DepartmentRef`, `MediaRecord` reference types).
- `lib/content/reader.ts` — `ContentReader` interface + `createReader(payload)` factory.
- `lib/content/memory-reader.ts` — `createMemoryReader(fixtures)` for tests.
- `lib/content/index.ts` — `getReader()` production singleton + barrel re-exports.
- `lib/page-shells/locale-detail-page.tsx` — `localeDetailPage` async helper.
- `lib/page-shells/locale-list-page.tsx` — `localeListPage` async helper.
- `lib/page-shells/locale-static-page.tsx` — `localeStaticPage` async helper.
- `lib/page-shells/index.ts` — barrel export.
- `tests/unit/content-memory-reader.test.ts` — Memory Reader unit tests.
- `tests/unit/content-reader.test.ts` — Payload-backed Reader unit tests with a fake `Payload`.
- `tests/unit/locale-detail-page.test.ts` — detail shell unit tests.
- `tests/unit/locale-list-page.test.ts` — list shell unit tests.
- `tests/unit/locale-static-page.test.ts` — static shell unit tests.

**Modify:** none. Plan 1 is purely additive.

---

## Task 1: Reader types

**Files:**
- Create: `lib/content/types.ts`
- Test: none (declarative types; checked at compile time by every later task)

- [ ] **Step 1: Create the types file with the full Doctor surface**

Create `lib/content/types.ts`:

```ts
import type { Locale } from '@/i18n/routing';

/**
 * Reference shapes — minimal info embedded in relations and uploads.
 * Returned by Payload when `depth >= 1` populates a relationship.
 */
export type MediaRecord = {
  id: string;
  url: string;
  alt: string;
};

export type DepartmentRef = {
  id: string;
  slug: string;
  name: string;
};

/**
 * DoctorRecord — Reader-resolved (one locale, flat strings).
 * The shape every page consumes when calling `reader.getDoctor(slug, locale)`.
 */
export type DoctorRecord = {
  id: string;
  slug: string;
  name: string;
  qualifications: string;
  specialty: string;
  departments: DepartmentRef[];
  languages: string[];
  opdDays: string | null;
  bio: unknown;
  registration: string | null;
  image: MediaRecord | null;
};

/**
 * BilingualDoctorRecord — withAllLocales() return shape.
 * Used by hreflang and parallel-slug callers (chiefly `generateMetadata`).
 * Slug is not localised on Doctor (institutional convention).
 */
export type BilingualDoctorRecord = {
  id: string;
  slug: string;
  name: { en: string; hi: string };
  qualifications: string;
  specialty: { en: string; hi: string };
  departments: DepartmentRef[];
  languages: { en: string[]; hi: string[] };
  opdDays: { en: string | null; hi: string | null };
  bio: { en: unknown; hi: unknown };
  registration: string | null;
  image: MediaRecord | null;
};

/**
 * Re-export Locale for callers that import everything from this module.
 */
export type { Locale };
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm typecheck`
Expected: PASS (no errors). The file declares only types; no runtime code.

- [ ] **Step 3: Commit**

```bash
git add lib/content/types.ts
git commit -m "feat(content): add Reader record types for Doctor surface

Defines DoctorRecord (Reader-resolved) and BilingualDoctorRecord
(withAllLocales) plus DepartmentRef and MediaRecord for the Doctor
surface only. Per-noun cutover plans add Department/Program/News/
Faculty/Page/Location types."
```

---

## Task 2: ContentReader interface (Doctor surface)

**Files:**
- Create: `lib/content/reader.ts` (interface only in this task; factory implementation in Task 4)
- Test: none (interface declaration; behaviour tested via memory/factory implementations)

- [ ] **Step 1: Create the interface file**

Create `lib/content/reader.ts`:

```ts
import type { Locale } from '@/i18n/routing';
import type {
  DoctorRecord,
  BilingualDoctorRecord,
} from './types';

/**
 * BilingualContentReader — the escape hatch returned by
 * ContentReader.withAllLocales(). Used for hreflang and parallel-slug
 * callers that need both locales of a record at once.
 *
 * Plan 1 ships only the Doctor surface; per-noun cutover plans expand.
 */
export type BilingualContentReader = {
  getDoctor(slug: string): Promise<BilingualDoctorRecord | null>;
};

/**
 * ContentReader — the typed read interface over Payload.
 *
 * The TYPE is the architectural module; `createReader` is the factory and
 * `getReader()` is the production singleton. Every page, the search lib,
 * and any future content surface read through this interface and never
 * call `getPayload(...)` directly.
 *
 * Returns Reader-resolved records by default (one locale, flat strings).
 * Use `withAllLocales()` for the bilingual escape hatch.
 *
 * Plan 1 ships only the Doctor surface. The interface grows per-noun in
 * subsequent cutover plans (Doctors → News → Departments → Programs →
 * Faculty → Pages → Locations).
 */
export type ContentReader = {
  getDoctor(slug: string, locale: Locale): Promise<DoctorRecord | null>;
  listDoctors(locale: Locale): Promise<DoctorRecord[]>;
  getDoctorsByDepartment(
    departmentSlug: string,
    locale: Locale,
  ): Promise<DoctorRecord[]>;
  /** All doctor slugs (not localised). Used by `generateStaticParams`. */
  listDoctorSlugs(): Promise<string[]>;
  /** Bilingual escape hatch — for hreflang + parallel-slug callers. */
  withAllLocales(): BilingualContentReader;
};

// Factory and singleton are defined in their own modules:
//   lib/content/reader.ts (this file)        — interface only
//   lib/content/memory-reader.ts             — createMemoryReader
//   lib/content/index.ts                     — getReader (production singleton)
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add lib/content/reader.ts
git commit -m "feat(content): add ContentReader interface (Doctor surface)

Declares the typed read interface over Payload. Methods cover
get/list doctors and the per-department filter, plus listDoctorSlugs
for generateStaticParams and withAllLocales for hreflang callers.
Implementations follow in subsequent commits."
```

---

## Task 3: Memory Reader (test adapter)

The Memory Reader is a `ContentReader` implementation that takes bilingual fixtures and returns them. It exists so Shell tests and per-noun cutover tests can run without a Payload bootstrap.

**Files:**
- Create: `lib/content/memory-reader.ts`
- Test: `tests/unit/content-memory-reader.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/content-memory-reader.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { createMemoryReader } from '@/lib/content/memory-reader';
import type { BilingualDoctorRecord } from '@/lib/content/types';

const drVimlesh: BilingualDoctorRecord = {
  id: 'd1',
  slug: 'vimlesh-sharma',
  name: { en: 'Dr. Vimlesh Sharma', hi: 'डॉ. विमलेश शर्मा' },
  qualifications: 'MBBS, MD (Obs & Gyn)',
  specialty: {
    en: 'IVF and Reproductive Medicine',
    hi: 'आईवीएफ और प्रजनन चिकित्सा',
  },
  departments: [{ id: 'dep-ivf', slug: 'ivf', name: 'IVF & Reproductive Medicine' }],
  languages: { en: ['Hindi', 'English'], hi: ['हिन्दी', 'अंग्रेज़ी'] },
  opdDays: { en: 'Mon–Sat', hi: 'सोम–शनि' },
  bio: { en: 'leads the centre', hi: 'केंद्र का नेतृत्व' },
  registration: null,
  image: null,
};

const drSanjay: BilingualDoctorRecord = {
  id: 'd2',
  slug: 'sanjay-rai',
  name: { en: 'Dr. Sanjay Rai', hi: 'डॉ. संजय राय' },
  qualifications: 'MBBS, MS, MCh',
  specialty: { en: 'Neurosurgery', hi: 'न्यूरोसर्जरी' },
  departments: [{ id: 'dep-ns', slug: 'neurosurgery', name: 'Neurosurgery' }],
  languages: { en: ['Hindi'], hi: ['हिन्दी'] },
  opdDays: { en: 'Tue, Thu', hi: 'मंगल, गुरु' },
  bio: { en: 'cranial + spinal', hi: 'क्रेनियल और स्पाइनल' },
  registration: null,
  image: null,
};

describe('createMemoryReader — Doctor surface', () => {
  it('getDoctor returns Reader-resolved record for the given locale', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('vimlesh-sharma', 'hi');
    expect(result).not.toBeNull();
    expect(result?.name).toBe('डॉ. विमलेश शर्मा');
    expect(result?.specialty).toBe('आईवीएफ और प्रजनन चिकित्सा');
    expect(result?.languages).toEqual(['हिन्दी', 'अंग्रेज़ी']);
  });

  it('getDoctor resolves the English locale when locale=en', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('vimlesh-sharma', 'en');
    expect(result?.name).toBe('Dr. Vimlesh Sharma');
    expect(result?.opdDays).toBe('Mon–Sat');
  });

  it('getDoctor returns null for an unknown slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctor('nobody', 'en');
    expect(result).toBeNull();
  });

  it('listDoctors returns all doctors in fixture order, locale-resolved', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.listDoctors('hi');
    expect(result).toHaveLength(2);
    expect(result[0]?.name).toBe('डॉ. विमलेश शर्मा');
    expect(result[1]?.name).toBe('डॉ. संजय राय');
  });

  it('listDoctors returns an empty array when no doctors fixture is supplied', async () => {
    const reader = createMemoryReader({});
    const result = await reader.listDoctors('en');
    expect(result).toEqual([]);
  });

  it('getDoctorsByDepartment filters by department slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.getDoctorsByDepartment('neurosurgery', 'en');
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe('sanjay-rai');
  });

  it('getDoctorsByDepartment returns empty array when no doctor matches', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.getDoctorsByDepartment('cardiology', 'en');
    expect(result).toEqual([]);
  });

  it('listDoctorSlugs returns slugs in fixture order (slug is not localised)', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh, drSanjay] });
    const result = await reader.listDoctorSlugs();
    expect(result).toEqual(['vimlesh-sharma', 'sanjay-rai']);
  });

  it('withAllLocales().getDoctor returns the bilingual record', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.withAllLocales().getDoctor('vimlesh-sharma');
    expect(result).not.toBeNull();
    expect(result?.name).toEqual({
      en: 'Dr. Vimlesh Sharma',
      hi: 'डॉ. विमलेश शर्मा',
    });
    expect(result?.specialty.hi).toBe('आईवीएफ और प्रजनन चिकित्सा');
  });

  it('withAllLocales().getDoctor returns null for an unknown slug', async () => {
    const reader = createMemoryReader({ doctors: [drVimlesh] });
    const result = await reader.withAllLocales().getDoctor('nobody');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/content-memory-reader.test.ts`
Expected: FAIL with "Cannot find module '@/lib/content/memory-reader'".

- [ ] **Step 3: Implement createMemoryReader**

Create `lib/content/memory-reader.ts`:

```ts
import type { Locale } from '@/i18n/routing';
import type {
  ContentReader,
  BilingualContentReader,
} from './reader';
import type {
  BilingualDoctorRecord,
  DoctorRecord,
} from './types';

/**
 * Fixture corpus shape for createMemoryReader. All fields optional;
 * unprovided collections behave as empty.
 */
export type MemoryFixtures = {
  doctors?: BilingualDoctorRecord[];
};

/**
 * Resolve a single Doctor fixture to one locale.
 */
function resolveDoctor(d: BilingualDoctorRecord, locale: Locale): DoctorRecord {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name[locale],
    qualifications: d.qualifications,
    specialty: d.specialty[locale],
    departments: d.departments,
    languages: d.languages[locale],
    opdDays: d.opdDays[locale],
    bio: d.bio[locale],
    registration: d.registration,
    image: d.image,
  };
}

/**
 * createMemoryReader — a ContentReader backed by an in-memory bilingual
 * fixture corpus. Used by unit tests so they don't need Postgres or a
 * Payload bootstrap. The implementation is plain JS; no asynchrony except
 * to satisfy the Promise-returning interface.
 */
export function createMemoryReader(fixtures: MemoryFixtures): ContentReader {
  const doctors = fixtures.doctors ?? [];

  const bilingual: BilingualContentReader = {
    async getDoctor(slug) {
      const found = doctors.find((d) => d.slug === slug);
      return found ?? null;
    },
  };

  return {
    async getDoctor(slug, locale) {
      const found = doctors.find((d) => d.slug === slug);
      return found ? resolveDoctor(found, locale) : null;
    },
    async listDoctors(locale) {
      return doctors.map((d) => resolveDoctor(d, locale));
    },
    async getDoctorsByDepartment(departmentSlug, locale) {
      return doctors
        .filter((d) => d.departments.some((dep) => dep.slug === departmentSlug))
        .map((d) => resolveDoctor(d, locale));
    },
    async listDoctorSlugs() {
      return doctors.map((d) => d.slug);
    },
    withAllLocales() {
      return bilingual;
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/content-memory-reader.test.ts`
Expected: PASS — all 10 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/content/memory-reader.ts tests/unit/content-memory-reader.test.ts
git commit -m "feat(content): add createMemoryReader for unit tests

Implements the ContentReader interface against an in-memory bilingual
fixture corpus. Lets Shell tests and per-noun cutover tests run with
no Postgres, no Payload bootstrap. Plan 1 covers Doctor surface;
fixture shape grows per noun in subsequent plans."
```

---

## Task 4: Payload-backed Reader factory

**Files:**
- Create: `lib/content/reader.ts` (extending the interface file from Task 2 with the `createReader` factory at the bottom)
- Test: `tests/unit/content-reader.test.ts`

The factory takes a `Payload` instance and returns a `ContentReader`. Tests pass a hand-stubbed `Payload`-shaped object so we can assert query shape and result mapping without a real database.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/content-reader.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import type { Payload } from 'payload';
import { createReader } from '@/lib/content/reader';

/**
 * Build a Payload-shaped fake whose `find` returns the queued response.
 * Tests assert against `find.mock.calls` to verify the query shape.
 */
function fakePayload(response: { docs: unknown[] }): Payload {
  const find = vi.fn().mockResolvedValue(response);
  return { find } as unknown as Payload;
}

const drVimleshDoc = {
  id: 'd1',
  slug: 'vimlesh-sharma',
  name: 'Dr. Vimlesh Sharma',
  qualifications: 'MBBS, MD (Obs & Gyn)',
  specialty: 'IVF and Reproductive Medicine',
  departments: [
    { id: 'dep-ivf', slug: 'ivf', name: 'IVF & Reproductive Medicine' },
  ],
  languages: [{ item: 'Hindi' }, { item: 'English' }],
  opdDays: 'Mon–Sat',
  bio: { type: 'lexical' },
  registration: null,
  image: null,
};

describe('createReader — Doctor surface', () => {
  it('getDoctor queries Payload with collection, slug filter, locale, and depth=1', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.getDoctor('vimlesh-sharma', 'hi');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { slug: { equals: 'vimlesh-sharma' } },
      locale: 'hi',
      depth: 1,
      limit: 1,
    });
  });

  it('getDoctor maps Payload doc to Reader-resolved DoctorRecord', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    const result = await reader.getDoctor('vimlesh-sharma', 'en');

    expect(result).toMatchObject({
      id: 'd1',
      slug: 'vimlesh-sharma',
      name: 'Dr. Vimlesh Sharma',
      specialty: 'IVF and Reproductive Medicine',
      languages: ['Hindi', 'English'],
      opdDays: 'Mon–Sat',
    });
  });

  it('getDoctor returns null when Payload returns no docs', async () => {
    const payload = fakePayload({ docs: [] });
    const reader = createReader(payload);

    const result = await reader.getDoctor('nobody', 'en');
    expect(result).toBeNull();
  });

  it('listDoctors queries with no slug filter and depth=1', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.listDoctors('hi');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      locale: 'hi',
      depth: 1,
      limit: 1000,
    });
  });

  it('getDoctorsByDepartment filters by department relationship slug', async () => {
    const payload = fakePayload({ docs: [drVimleshDoc] });
    const reader = createReader(payload);

    await reader.getDoctorsByDepartment('ivf', 'en');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { 'departments.slug': { equals: 'ivf' } },
      locale: 'en',
      depth: 1,
      limit: 1000,
    });
  });

  it('listDoctorSlugs queries with locale=en, depth=0, returns slug strings only', async () => {
    const payload = fakePayload({
      docs: [{ slug: 'vimlesh-sharma' }, { slug: 'sanjay-rai' }],
    });
    const reader = createReader(payload);

    const result = await reader.listDoctorSlugs();

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      locale: 'en',
      depth: 0,
      limit: 1000,
      select: { slug: true },
    });
    expect(result).toEqual(['vimlesh-sharma', 'sanjay-rai']);
  });

  it('withAllLocales().getDoctor queries with locale=all and returns bilingual maps', async () => {
    const bilingualDoc = {
      ...drVimleshDoc,
      name: { en: 'Dr. Vimlesh Sharma', hi: 'डॉ. विमलेश शर्मा' },
      specialty: {
        en: 'IVF and Reproductive Medicine',
        hi: 'आईवीएफ और प्रजनन चिकित्सा',
      },
      languages: {
        en: [{ item: 'Hindi' }, { item: 'English' }],
        hi: [{ item: 'हिन्दी' }, { item: 'अंग्रेज़ी' }],
      },
      opdDays: { en: 'Mon–Sat', hi: 'सोम–शनि' },
      bio: { en: { type: 'lexical' }, hi: { type: 'lexical' } },
    };
    const payload = fakePayload({ docs: [bilingualDoc] });
    const reader = createReader(payload);

    const result = await reader.withAllLocales().getDoctor('vimlesh-sharma');

    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'doctors',
      where: { slug: { equals: 'vimlesh-sharma' } },
      locale: 'all',
      depth: 1,
      limit: 1,
    });
    expect(result?.name).toEqual({
      en: 'Dr. Vimlesh Sharma',
      hi: 'डॉ. विमलेश शर्मा',
    });
    expect(result?.languages.en).toEqual(['Hindi', 'English']);
    expect(result?.languages.hi).toEqual(['हिन्दी', 'अंग्रेज़ी']);
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/content-reader.test.ts`
Expected: FAIL with "createReader is not a function" or similar.

- [ ] **Step 3: Add the createReader factory at the bottom of `lib/content/reader.ts`**

Append the following to the existing `lib/content/reader.ts` (Task 2's interface stays at the top; this adds the implementation):

```ts
import type { Payload } from 'payload';
import type {
  DoctorRecord,
  BilingualDoctorRecord,
  DepartmentRef,
  MediaRecord,
} from './types';

// ---------- Field unwrapping helpers ----------

type ArrayItem = { item: string } | string;

function unwrapArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && 'item' in entry) {
        return String((entry as { item: unknown }).item);
      }
      return null;
    })
    .filter((v): v is string => typeof v === 'string');
}

function unwrapBilingualArray(value: unknown): { en: string[]; hi: string[] } {
  if (value && typeof value === 'object' && 'en' in value && 'hi' in value) {
    const v = value as { en: unknown; hi: unknown };
    return { en: unwrapArray(v.en), hi: unwrapArray(v.hi) };
  }
  return { en: [], hi: [] };
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asMediaRecord(value: unknown): MediaRecord | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as { id?: unknown; url?: unknown; alt?: unknown };
  if (typeof v.id !== 'string' && typeof v.id !== 'number') return null;
  if (typeof v.url !== 'string') return null;
  return {
    id: String(v.id),
    url: v.url,
    alt: typeof v.alt === 'string' ? v.alt : '',
  };
}

function asDepartmentRefs(value: unknown): DepartmentRef[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): DepartmentRef | null => {
      if (!entry || typeof entry !== 'object') return null;
      const e = entry as { id?: unknown; slug?: unknown; name?: unknown };
      if (e.id == null || typeof e.slug !== 'string' || typeof e.name !== 'string') {
        return null;
      }
      return { id: String(e.id), slug: e.slug, name: e.name };
    })
    .filter((v): v is DepartmentRef => v !== null);
}

// ---------- Doc → Record mappers ----------

function mapDoctor(doc: unknown): DoctorRecord {
  const d = doc as Record<string, unknown>;
  return {
    id: String(d.id),
    slug: asString(d.slug),
    name: asString(d.name),
    qualifications: asString(d.qualifications),
    specialty: asString(d.specialty),
    departments: asDepartmentRefs(d.departments),
    languages: unwrapArray(d.languages),
    opdDays: asNullableString(d.opdDays),
    bio: d.bio ?? null,
    registration: asNullableString(d.registration),
    image: asMediaRecord(d.image),
  };
}

function mapBilingualDoctor(doc: unknown): BilingualDoctorRecord {
  const d = doc as Record<string, unknown>;
  const name = (d.name ?? { en: '', hi: '' }) as { en: unknown; hi: unknown };
  const specialty = (d.specialty ?? { en: '', hi: '' }) as { en: unknown; hi: unknown };
  const opdDays = (d.opdDays ?? { en: null, hi: null }) as {
    en: unknown;
    hi: unknown;
  };
  const bio = (d.bio ?? { en: null, hi: null }) as { en: unknown; hi: unknown };
  return {
    id: String(d.id),
    slug: asString(d.slug),
    name: { en: asString(name.en), hi: asString(name.hi) },
    qualifications: asString(d.qualifications),
    specialty: { en: asString(specialty.en), hi: asString(specialty.hi) },
    departments: asDepartmentRefs(d.departments),
    languages: unwrapBilingualArray(d.languages),
    opdDays: {
      en: asNullableString(opdDays.en),
      hi: asNullableString(opdDays.hi),
    },
    bio: { en: bio.en, hi: bio.hi },
    registration: asNullableString(d.registration),
    image: asMediaRecord(d.image),
  };
}

// ---------- Factory ----------

/**
 * createReader — construct a ContentReader bound to a Payload instance.
 *
 * Production code uses `getReader()` from lib/content/index.ts which
 * memoises a singleton wired to the production Payload client. Tests
 * use createMemoryReader from lib/content/memory-reader.ts; only
 * Reader-internal tests pass a fake Payload directly to this factory.
 */
export function createReader(payload: Payload): ContentReader {
  const bilingual: BilingualContentReader = {
    async getDoctor(slug) {
      const result = await payload.find({
        collection: 'doctors',
        where: { slug: { equals: slug } },
        locale: 'all',
        depth: 1,
        limit: 1,
      });
      const doc = result.docs[0];
      return doc ? mapBilingualDoctor(doc) : null;
    },
  };

  return {
    async getDoctor(slug, locale) {
      const result = await payload.find({
        collection: 'doctors',
        where: { slug: { equals: slug } },
        locale,
        depth: 1,
        limit: 1,
      });
      const doc = result.docs[0];
      return doc ? mapDoctor(doc) : null;
    },
    async listDoctors(locale) {
      const result = await payload.find({
        collection: 'doctors',
        locale,
        depth: 1,
        limit: 1000,
      });
      return result.docs.map(mapDoctor);
    },
    async getDoctorsByDepartment(departmentSlug, locale) {
      const result = await payload.find({
        collection: 'doctors',
        where: { 'departments.slug': { equals: departmentSlug } },
        locale,
        depth: 1,
        limit: 1000,
      });
      return result.docs.map(mapDoctor);
    },
    async listDoctorSlugs() {
      const result = await payload.find({
        collection: 'doctors',
        locale: 'en',
        depth: 0,
        limit: 1000,
        select: { slug: true },
      });
      return result.docs
        .map((doc) => {
          const d = doc as { slug?: unknown };
          return typeof d.slug === 'string' ? d.slug : null;
        })
        .filter((v): v is string => v !== null);
    },
    withAllLocales() {
      return bilingual;
    },
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/content-reader.test.ts`
Expected: PASS — all 7 tests green.

- [ ] **Step 5: Run the typechecker to catch any type drift**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 6: Commit**

```ts
// no code change in this step — verification + commit only
```

```bash
git add lib/content/reader.ts tests/unit/content-reader.test.ts
git commit -m "feat(content): add createReader factory bound to Payload

Implements the Doctor surface against payload.find() with locale
threading, depth=1 for relationship population, and field-shape
unwrapping (Payload's array-of-{item} convention → string[],
upload→MediaRecord, relationship→DepartmentRef). withAllLocales
queries with locale=all for bilingual maps.

Tests use a vi.fn-backed Payload-shaped fake to assert both query
shape and result mapping; no real Postgres is touched."
```

---

## Task 5: Production singleton (`getReader`)

**Files:**
- Create: `lib/content/index.ts` (singleton + barrel re-exports)
- Test: `tests/unit/content-reader.test.ts` is updated with one smoke test that asserts the singleton caches its Promise. (The singleton wires `getPayload({ config })` so it can't be exercised against a real DB in unit tests; the smoke test mocks the dependencies.)

- [ ] **Step 1: Add the smoke test for `getReader` caching**

Append the following block to `tests/unit/content-reader.test.ts` (after the `describe('createReader — Doctor surface', ...)` block):

```ts
import { vi as viDescribe } from 'vitest';

describe('getReader — production singleton', () => {
  beforeEach(() => {
    viDescribe.resetModules();
  });

  it('returns the same Promise across calls (cached)', async () => {
    viDescribe.doMock('payload', () => ({
      getPayload: viDescribe.fn().mockResolvedValue({ find: viDescribe.fn() }),
    }));
    viDescribe.doMock('@payload-config', () => ({ default: {} }));

    const { getReader } = await import('@/lib/content');

    const a = getReader();
    const b = getReader();

    expect(a).toBe(b);

    const { getPayload } = await import('payload');
    expect(getPayload).toHaveBeenCalledTimes(1);
  });
});
```

Also add `beforeEach` to the imports at the top of the file:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/content-reader.test.ts`
Expected: FAIL with "Cannot find module '@/lib/content'".

- [ ] **Step 3: Implement the singleton**

Create `lib/content/index.ts`:

```ts
import { getPayload } from 'payload';
import config from '@payload-config';
import { createReader } from './reader';
import type { ContentReader } from './reader';

/**
 * Lazy-initialised production singleton. The Promise is cached so every
 * caller awaits the same Reader instance (and the same underlying Payload
 * client). Safe under React Server Components: each request fans out to
 * many Reader calls, all going through this single Payload connection.
 */
let cached: Promise<ContentReader> | null = null;

export function getReader(): Promise<ContentReader> {
  if (cached === null) {
    cached = getPayload({ config }).then(createReader);
  }
  return cached;
}

// Barrel re-exports — every consumer imports from '@/lib/content'.
export type {
  ContentReader,
  BilingualContentReader,
} from './reader';
export { createReader } from './reader';
export { createMemoryReader } from './memory-reader';
export type { MemoryFixtures } from './memory-reader';
export type {
  DoctorRecord,
  BilingualDoctorRecord,
  DepartmentRef,
  MediaRecord,
  Locale,
} from './types';
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/content-reader.test.ts`
Expected: PASS — 8 tests green (7 from Task 4 + 1 singleton smoke test).

- [ ] **Step 5: Run the full Vitest suite to confirm nothing else broke**

Run: `pnpm test`
Expected: PASS — existing `messages`, `security`, `site` specs still green; new `content-reader` and `content-memory-reader` specs green.

- [ ] **Step 6: Commit**

```bash
git add lib/content/index.ts tests/unit/content-reader.test.ts
git commit -m "feat(content): add getReader production singleton

Lazy-initialises a ContentReader against the production Payload client
and caches the Promise. Every server-side caller imports getReader from
@/lib/content; never call getPayload directly outside this module.

Adds barrel re-exports so consumers get the full Reader surface from a
single import path."
```

---

## Task 6: `localeDetailPage` shell

**Files:**
- Create: `lib/page-shells/locale-detail-page.tsx`
- Test: `tests/unit/locale-detail-page.test.ts`

The Shell takes a `fetch` function (returning `Promise<T | null>`), an optional `jsonLd` builder, and a `body` render function. It primes the locale, awaits the fetch, calls `notFound()` if null, emits `<JsonLd>` if a builder was supplied, and delegates the body.

Tests mock `next/navigation` so `notFound()` throws a known marker; mock `next-intl/server` so `setRequestLocale` is a no-op. Render the returned element via `react-dom/server`'s `renderToStaticMarkup` and assert against the HTML string.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/locale-detail-page.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const NOT_FOUND_MARKER = '__test_not_found__';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error(NOT_FOUND_MARKER);
  },
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeDetailPage } from '@/lib/page-shells/locale-detail-page';
import { setRequestLocale } from 'next-intl/server';

type Doctor = { name: string; slug: string };

describe('localeDetailPage', () => {
  it('primes the request locale before fetching', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ name: 'Dr. Test', slug: 'x' });

    await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: fetchFn,
      body: () => null,
    });

    expect(setRequestLocale).toHaveBeenCalledWith('en');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('renders the body with the resolved record', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: async () => ({ name: 'Dr. Test', slug: 'x' }),
      body: (d) => <h1>{d.name}</h1>,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<h1>Dr. Test</h1>');
  });

  it('throws (calls notFound) when fetch returns null', async () => {
    await expect(
      localeDetailPage<Doctor>({
        locale: 'en',
        fetch: async () => null,
        body: () => null,
      }),
    ).rejects.toThrow(NOT_FOUND_MARKER);
  });

  it('emits exactly one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: async () => ({ name: 'Dr. Test', slug: 'x' }),
      jsonLd: (d) => ({ '@type': 'Physician', name: d.name }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    const scriptCount = (html.match(/application\/ld\+json/g) ?? []).length;
    expect(scriptCount).toBe(1);
    expect(html).toContain('"@type":"Physician"');
    expect(html).toContain('"name":"Dr. Test"');
  });

  it('emits zero ld+json scripts when jsonLd is omitted', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'hi',
      fetch: async () => ({ name: 'टेस्ट', slug: 'x' }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain('application/ld+json');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/locale-detail-page.test.ts`
Expected: FAIL with "Cannot find module '@/lib/page-shells/locale-detail-page'".

- [ ] **Step 3: Implement the shell**

Create `lib/page-shells/locale-detail-page.tsx`:

```tsx
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

/**
 * Props for localeDetailPage. Generic in the resource type T.
 */
export type LocaleDetailPageProps<T> = {
  /** The route's resolved locale. */
  locale: Locale;
  /** Reader-shaped data fetch. Return null to trigger notFound(). */
  fetch: () => Promise<T | null>;
  /** Optional builder for the page-specific JSON-LD payload. */
  jsonLd?: (record: T) => unknown;
  /** Render the page body given the resolved record. */
  body: (record: T) => ReactNode;
};

/**
 * localeDetailPage — the Locale Page Shell for `[slug]` routes.
 *
 * Owns: locale priming, fetch + notFound, JSON-LD emission, and
 * delegation of the body to the page-supplied render function. The
 * Shell knows nothing about specific resource types — `fetch` is the
 * single one-line interface to the data layer (typically a call to
 * `(await getReader()).getDoctor(...)` or similar at the page-call
 * site, though any function returning `Promise<T | null>` works).
 *
 * Locale-side metadata (canonical, hreflang, JSON-LD in `<head>`) is
 * still emitted by the page's own `generateMetadata` export — the
 * Shell only emits the `application/ld+json` body script.
 */
export async function localeDetailPage<T>({
  locale,
  fetch,
  jsonLd,
  body,
}: LocaleDetailPageProps<T>): Promise<ReactNode> {
  setRequestLocale(locale);
  const record = await fetch();
  if (!record) notFound();
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd(record)} /> : null}
      {body(record)}
    </>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/locale-detail-page.test.ts`
Expected: PASS — 5 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/page-shells/locale-detail-page.tsx tests/unit/locale-detail-page.test.ts
git commit -m "feat(page-shells): add localeDetailPage shell

Generic shell for [slug] routes. Owns locale priming, fetch + notFound,
JSON-LD body emission, and body delegation. Takes a fetch function
returning Promise<T | null> (the seam to the ContentReader) plus a body
render function. Page-side generateMetadata still owns canonical and
hreflang."
```

---

## Task 7: `localeListPage` shell

**Files:**
- Create: `lib/page-shells/locale-list-page.tsx`
- Test: `tests/unit/locale-list-page.test.ts`

Same pattern as Task 6 but for hub/list pages. Takes `list: () => Promise<T[]>` instead of `fetch`. Doesn't call `notFound()` — an empty list is a valid render.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/locale-list-page.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeListPage } from '@/lib/page-shells/locale-list-page';
import { setRequestLocale } from 'next-intl/server';

type Doctor = { name: string; slug: string };

describe('localeListPage', () => {
  it('primes the request locale before fetching', async () => {
    const listFn = vi.fn().mockResolvedValue([]);
    await localeListPage<Doctor>({
      locale: 'hi',
      list: listFn,
      body: () => null,
    });
    expect(setRequestLocale).toHaveBeenCalledWith('hi');
    expect(listFn).toHaveBeenCalledTimes(1);
  });

  it('renders the body with the resolved list', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [
        { name: 'Dr. A', slug: 'a' },
        { name: 'Dr. B', slug: 'b' },
      ],
      body: (records) => (
        <ul>
          {records.map((d) => (
            <li key={d.slug}>{d.name}</li>
          ))}
        </ul>
      ),
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<li>Dr. A</li>');
    expect(html).toContain('<li>Dr. B</li>');
  });

  it('renders the body with an empty array when list returns empty', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [],
      body: (records) => <p>{records.length === 0 ? 'No results' : 'Some'}</p>,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<p>No results</p>');
  });

  it('emits one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [{ name: 'A', slug: 'a' }],
      jsonLd: (records) => ({
        '@type': 'ItemList',
        numberOfItems: records.length,
      }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    expect((html.match(/application\/ld\+json/g) ?? []).length).toBe(1);
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"numberOfItems":1');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/locale-list-page.test.ts`
Expected: FAIL with "Cannot find module '@/lib/page-shells/locale-list-page'".

- [ ] **Step 3: Implement the shell**

Create `lib/page-shells/locale-list-page.tsx`:

```tsx
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

export type LocaleListPageProps<T> = {
  locale: Locale;
  list: () => Promise<T[]>;
  jsonLd?: (records: T[]) => unknown;
  body: (records: T[]) => ReactNode;
};

/**
 * localeListPage — the Locale Page Shell for hub / list routes.
 *
 * Owns: locale priming, list fetch, optional JSON-LD body emission,
 * and body delegation. Does not call notFound() — an empty list is a
 * valid render outcome (the body is responsible for handling that
 * case).
 */
export async function localeListPage<T>({
  locale,
  list,
  jsonLd,
  body,
}: LocaleListPageProps<T>): Promise<ReactNode> {
  setRequestLocale(locale);
  const records = await list();
  return (
    <>
      {jsonLd ? <JsonLd data={jsonLd(records)} /> : null}
      {body(records)}
    </>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/locale-list-page.test.ts`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/page-shells/locale-list-page.tsx tests/unit/locale-list-page.test.ts
git commit -m "feat(page-shells): add localeListPage shell

Generic shell for hub/list routes. Owns locale priming, list fetch,
and optional JSON-LD emission. Empty list is a valid render outcome
(no notFound). Body receives the resolved array."
```

---

## Task 8: `localeStaticPage` shell

**Files:**
- Create: `lib/page-shells/locale-static-page.tsx`
- Test: `tests/unit/locale-static-page.test.ts`

Same pattern as Task 6 but for pages with no Reader fetch (about, contact, emergency, search results page chrome, admissions, research, hub pages that don't list a single resource). Just primes the locale and renders the body.

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/locale-static-page.test.ts`:

```ts
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeStaticPage } from '@/lib/page-shells/locale-static-page';
import { setRequestLocale } from 'next-intl/server';

describe('localeStaticPage', () => {
  it('primes the request locale', async () => {
    await localeStaticPage({
      locale: 'en',
      body: () => null,
    });
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders the body', async () => {
    const tree = await localeStaticPage({
      locale: 'en',
      body: () => <main>About page body</main>,
    });
    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<main>About page body</main>');
  });

  it('emits one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeStaticPage({
      locale: 'hi',
      jsonLd: { '@type': 'WebPage', name: 'संपर्क' },
      body: () => null,
    });
    const html = renderToStaticMarkup(tree);
    expect((html.match(/application\/ld\+json/g) ?? []).length).toBe(1);
    expect(html).toContain('"@type":"WebPage"');
  });

  it('emits no ld+json when jsonLd is omitted', async () => {
    const tree = await localeStaticPage({
      locale: 'en',
      body: () => null,
    });
    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain('application/ld+json');
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `pnpm test tests/unit/locale-static-page.test.ts`
Expected: FAIL with "Cannot find module '@/lib/page-shells/locale-static-page'".

- [ ] **Step 3: Implement the shell**

Create `lib/page-shells/locale-static-page.tsx`:

```tsx
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/json-ld';
import type { Locale } from '@/i18n/routing';

export type LocaleStaticPageProps = {
  locale: Locale;
  /**
   * Optional JSON-LD payload. Static — not parameterised on a record,
   * since static pages have nothing to fetch. Compute it at the call
   * site if it depends on the locale.
   */
  jsonLd?: unknown;
  body: () => ReactNode;
};

/**
 * localeStaticPage — the Locale Page Shell for routes with no Reader
 * fetch (about, contact, emergency, hubs without a list, etc.).
 *
 * Owns: locale priming + optional JSON-LD body emission. The body is
 * a parameterless render function because there's no record to
 * thread.
 */
export async function localeStaticPage({
  locale,
  jsonLd,
  body,
}: LocaleStaticPageProps): Promise<ReactNode> {
  setRequestLocale(locale);
  return (
    <>
      {jsonLd !== undefined ? <JsonLd data={jsonLd} /> : null}
      {body()}
    </>
  );
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `pnpm test tests/unit/locale-static-page.test.ts`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add lib/page-shells/locale-static-page.tsx tests/unit/locale-static-page.test.ts
git commit -m "feat(page-shells): add localeStaticPage shell

Generic shell for routes with no Reader fetch (about, contact,
emergency, etc.). Owns locale priming + optional JSON-LD body
emission. Body is parameterless — no record to thread."
```

---

## Task 9: Page-shells barrel export

**Files:**
- Create: `lib/page-shells/index.ts`
- Test: none (re-exports only; existing tests prove the underlying modules work)

- [ ] **Step 1: Create the barrel**

Create `lib/page-shells/index.ts`:

```ts
export { localeDetailPage } from './locale-detail-page';
export type { LocaleDetailPageProps } from './locale-detail-page';

export { localeListPage } from './locale-list-page';
export type { LocaleListPageProps } from './locale-list-page';

export { localeStaticPage } from './locale-static-page';
export type { LocaleStaticPageProps } from './locale-static-page';
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Smoke import via the barrel from a test (no new file — modify Task 6's test to import via the barrel)**

This step is verification only — no code change. The existing tests already exercise each shell directly. The barrel just gives consumers a single import path.

- [ ] **Step 4: Commit**

```bash
git add lib/page-shells/index.ts
git commit -m "feat(page-shells): add barrel export

One import path for all three shells: import { localeDetailPage,
localeListPage, localeStaticPage } from '@/lib/page-shells'."
```

---

## Task 10: Final verification

**Files:** none. Pure verification.

- [ ] **Step 1: Run the full Vitest suite**

Run: `pnpm test`
Expected: PASS. All existing specs still green; new specs added by tasks 3, 4, 5, 6, 7, 8 also green. Approximate counts:
- `messages.test.ts` (existing) — green
- `security.test.ts` (existing) — green
- `site.test.ts` (existing) — green
- `content-memory-reader.test.ts` (new, 10 tests) — green
- `content-reader.test.ts` (new, 8 tests including the singleton smoke) — green
- `locale-detail-page.test.ts` (new, 5 tests) — green
- `locale-list-page.test.ts` (new, 4 tests) — green
- `locale-static-page.test.ts` (new, 4 tests) — green

- [ ] **Step 2: Run typecheck across the repo**

Run: `pnpm typecheck`
Expected: PASS — no errors. The new `lib/content/*` and `lib/page-shells/*` modules typecheck cleanly; no existing file was modified.

- [ ] **Step 3: Run the linter**

Run: `pnpm lint`
Expected: PASS.

- [ ] **Step 4: Run the e2e suite to confirm no regression in existing pages**

Run: `pnpm test:e2e`
Expected: PASS. Plan 1 changed nothing under `app/`, `components/`, or `proxy.ts`, so all home / ui-ux / a11y / SEO / adversarial / visual specs should be unaffected. If anything is red, the cause is unrelated to this plan and should be triaged separately.

- [ ] **Step 5: Final commit (if any housekeeping changes were needed) and tag the milestone**

If steps 1–4 surfaced any small fixes (missing import, stray any, etc.), commit them with a focused message. Otherwise this step is a no-op.

```bash
# Only if there were fixes:
git add -p
git commit -m "chore(content): tidy up after final verification"
```

---

## Self-review (per writing-plans skill)

**1. Spec coverage.** Each spine decision from the arch-review-checkpoint Resolution maps to a task:

- Decision A (Payload wins everywhere): not in this plan; the ADR captures it. Plan 1 is purely additive and makes no consumer changes.
- Decision B (`ContentReader` typed interface; locale-resolved by default; `withAllLocales()` escape hatch): Tasks 1, 2, 4, 5.
- Decision C (3 generic Locale Page Shells: detail / list / static): Tasks 6, 7, 8, 9.
- Decision D (factory + singleton + Shell-takes-fetch-fn): Tasks 3 (memory factory), 4 (Payload factory), 5 (singleton). Shell-takes-fetch-fn is realised in Tasks 6, 7, 8.

Cascading consequences from the Resolution:
- Candidate #3 (kill inline copy ternaries) — handled implicitly because the Reader returns Reader-resolved records; the inline ternaries get cleaned up during the per-noun cutover plans, not here.
- Candidate #4 (`lib/href.ts`) — unchanged in Plan 1; handled in cutover plans when Reader's parallel-slug helper is consumed.

**2. Placeholder scan.** No "TBD" / "implement later" / "similar to Task N". Every code step contains the actual code. The one exception is Task 9 Step 3 ("smoke import") which is intentionally no-op — clearly labelled.

**3. Type consistency.** `ContentReader` uses the same method names (`getDoctor`, `listDoctors`, `getDoctorsByDepartment`, `listDoctorSlugs`, `withAllLocales`) across Tasks 2, 3, 4, and 5. `BilingualContentReader` exposes only `getDoctor(slug)` (no locale param) consistently. Type names (`DoctorRecord`, `BilingualDoctorRecord`, `DepartmentRef`, `MediaRecord`, `MemoryFixtures`, `LocaleDetailPageProps`, `LocaleListPageProps`, `LocaleStaticPageProps`) are stable across the plan.

**4. Test fixture realism.** Doctor fixtures in tests use real institutional names and Hindi transliterations from `content/data/doctors.ts` (Vimlesh Sharma, Sanjay Rai). This makes failure messages legible and matches the project's bilingual discipline.

---

## What this plan does NOT do (deferred to subsequent plans)

- **Plan 2 — Doctor cutover.** Convert every Doctor consumer (`app/[locale]/page.tsx` featured doctors section, `app/[locale]/patients/doctors/page.tsx`, `[slug]/page.tsx`, `doctors-browser.tsx`, `app/[locale]/patients/departments/[slug]/page.tsx` doctor list, `app/[locale]/academics/faculty/page.tsx`, `lib/search.ts` doctor index) to use `ContentReader`. Adopt the three Locale Page Shells where they apply. Update `tests/e2e/*` if any doctor-data assertion shifts. Delete runtime imports of `content/data/doctors.ts`. Generate `payload-types.ts` and replace hand-rolled `DoctorRecord` field types with checks against the generated schema.
- **Plan 3 — News cutover.** Same shape for News.
- **Plan 4 — Department / Program / Faculty / Page / Location cutover.** Bulk; lower risk per noun.
- **Plan 5 — Search lib cutover (`pg_trgm`).** Out of scope until at least Doctor + News are in Payload.
- **Plan 6 — Navigation Map (candidate #5 from the original review).** Independent track.

Each plan should produce working, testable software on its own.
