# Doctor cutover — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Flip every Doctor consumer in `app/**` from `content/data/doctors` (legacy seed corpus) to `getReader()` (the ContentReader singleton shipped in Plan 1). Adopt the Locale Page Shells where they apply. After this plan: every `app/[locale]/**` page that renders a doctor reads through the Reader; the only remaining importer of `content/data/doctors.ts` is `lib/search.ts` (covered by Plan 5).

**Why now:** Plan 1 shipped the ContentReader infrastructure but zero runtime consumers — the deletion test currently passes for `lib/content/` and `lib/page-shells/`. Plan 2 makes the architecture earn its keep on the Doctor surface and exposes any integration debt (Lexical bio shape, Media upload shape, DepartmentRef thinness) before News / Department / Program / Faculty / Page / Location cutovers compound the cost.

**Tech stack:** TypeScript 5.7, Payload 3.84, `@payloadcms/richtext-lexical/react` 3.84 (already in `package.json`), Next 16 RSC, React 19, next-intl 4, Vitest 4.1.5, Playwright (existing config).

**Source documents:**
- [`CONTEXT.md`](../../CONTEXT.md) — architectural terms.
- [`docs/plans/2026-05-09-content-reader-and-page-shells.md`](./2026-05-09-content-reader-and-page-shells.md) — Plan 1 spec.
- Adversarial convergence report (in-conversation, dated 2026-05-09) — surfaced cutover blockers re-encoded as tasks here.

**Out of scope:**
- `lib/search.ts` cutover (Plan 5 — needs a `BilingualContentReader.listDoctors()` addition that's deferred until search is ready to switch off the in-memory index).
- News, Department, Program, Faculty, Page, Location data surfaces — covered by Plans 3 and 4. (The Department PAGE is in scope here because it lists doctors; only the Doctor-related call site is touched.)
- Generated-types library churn beyond Doctor: Payload's `payload-types.ts` is generated for the whole schema, but only the `Doctor` slice is consumed by this plan.

**Three architectural decisions baked into this plan (decided up front to avoid mid-plan grilling):**

- **Decision A — Lexical bio rendering:** Use `@payloadcms/richtext-lexical/react`'s `RichText` component for body rendering. For JSON-LD `description`, walk the Lexical tree to extract plain text via a small helper at `lib/content/lexical.ts`. **Rationale:** the official renderer is already a dependency; hand-rolling would re-implement Lexical node typing.
- **Decision B — Related-departments shape:** Add `getDepartment(slug, locale)` to `ContentReader` (returns a Reader-resolved `DepartmentRecord` with `summary`). Keep `DepartmentRef` thin (id/slug/name) for embedded relations. **Rationale:** N+1 is acceptable on the Doctor detail page (max 2-3 related departments per doctor); fattening `DepartmentRef` would couple every relation embed to the full record shape and drag every per-noun cutover. The new method is a one-paragraph addition.
- **Decision C — Real-Payload integration test:** Playwright E2E spec that boots the Next dev server against a seeded Payload-Postgres backend and asserts the Hindi seeded name renders on `/hi/patients/doctors/vimlesh-sharma`. **Rationale:** Vitest with a real DB is heavier than Playwright with the existing dev infrastructure; we already have `pnpm docker:dev` and `pnpm seed`.

---

## File structure

**Create:**
- `lib/content/lexical.ts` — `lexicalToPlainText(node: unknown): string` helper.
- `tests/unit/lexical.test.ts` — unit tests for the helper.
- `tests/unit/json-ld.test.tsx` — regression suite for the `JsonLd` guard.
- `tests/e2e/doctor-cutover.spec.ts` — real-Payload integration smoke (Decision C).
- `payload-types.ts` (generated, committed) — schema-typed source of truth via `pnpm payload generate:types`.

**Modify:**
- `lib/content/types.ts` — add `DepartmentRecord` + `BilingualDepartmentRecord`.
- `lib/content/reader.ts` — add `getDepartment(slug, locale)` + `withAllLocales().getDepartment(slug)`.
- `lib/content/memory-reader.ts` — implement the new methods + `departments` fixture key.
- `lib/content/index.ts` — re-export `DepartmentRecord` types.
- `tests/unit/content-reader.test.ts` — add 3 tests for `getDepartment` and the bilingual variant.
- `tests/unit/content-memory-reader.test.ts` — add 3 tests for `getDepartment`.
- `components/json-ld.tsx` — add a runtime guard that returns `null` when `JSON.stringify(data)` is not a string (i.e. `data` is `undefined`, a Symbol, or a function). Dev-only `console.warn`. The existing escape pipeline and inline-script-injection mechanism stay; only the early-return is added.
- `app/[locale]/patients/doctors/[slug]/page.tsx` — adopt `localeDetailPage` + `getReader().getDoctor` + Lexical bio renderer.
- `app/[locale]/patients/doctors/page.tsx` — adopt `localeListPage` + `getReader().listDoctors`.
- `app/[locale]/patients/doctors/doctors-browser.tsx` — accept the new `DoctorRow` shape (image as URL string, derived at the page level from `MediaRecord.url`).
- `app/[locale]/page.tsx` — swap `doctors` import for `getReader().listDoctors(locale)`; map the result into the existing `featuredDoctors` shape.
- `app/[locale]/patients/departments/[slug]/page.tsx` — swap legacy `getDoctorsByDepartment` for `getReader().getDoctorsByDepartment`.
- `app/[locale]/academics/faculty/page.tsx` — swap `doctors` import for `getReader().listDoctors(locale)`.
- `package.json` — add `"payload:types": "payload generate:types"` script if not present.

**Do not modify:**
- `lib/search.ts` (Plan 5).
- `content/data/doctors.ts` (still consumed by `lib/search.ts` and the seeder).
- `scripts/seed.ts` (no schema changes; seeder still pumps the same fixtures).

---

## Task 0: Pre-flight (worktree + baseline)

**Files:** none. Pure setup.

- [ ] **Step 1: Create an isolated worktree on a fresh branch off `main`.**

```bash
git worktree add .worktrees/doctor-cutover -b feature/doctor-cutover main
cd .worktrees/doctor-cutover
cp ../../next-env.d.ts .   # gitignored Next.js types — copy from main worktree
pnpm install --frozen-lockfile
```

- [ ] **Step 2: Verify baseline tests + typecheck + lint pass.**

```bash
pnpm typecheck && pnpm lint && pnpm test
```

Expected: typecheck PASS, lint PASS, vitest 44/45 PASS (the 1 pre-existing security failure on `main` is unrelated; document it in the worktree's `NOTES.md` or just acknowledge in the final review).

- [ ] **Step 3: Confirm Payload + Postgres can boot for Decision C's integration test.**

```bash
pnpm docker:dev    # in another terminal; leave running
# Wait for http://localhost:3000/admin to respond
pnpm seed
```

Expected: seed completes; `/admin` shows the Doctor collection populated. If this fails, **stop the plan** — Tasks 9 and 11 require a working Payload-Postgres-seed pipeline.

---

## Task 1: Generate `payload-types.ts`

**Files:**
- Create (committed): `payload-types.ts` (generated by Payload CLI).
- Modify: `package.json` — add `"payload:types"` script.

- [ ] **Step 1: Add the codegen script if missing.**

In `package.json` `scripts`:
```json
"payload:types": "payload generate:types"
```

- [ ] **Step 2: Generate types against the running Payload (Docker `web` service from Task 0 Step 3).**

```bash
pnpm payload:types
```

Expected: `payload-types.ts` created at repo root, ~hundreds of lines, with `Doctor`, `Department`, `Media`, etc. interfaces.

- [ ] **Step 3: Commit the generated file as the schema-typed source of truth.**

```bash
git add package.json payload-types.ts
git commit -m "chore(payload): generate payload-types.ts and add codegen script"
```

**Do not** consume `Doctor` from `payload-types.ts` in `lib/content/types.ts` — `DoctorRecord` is the Reader's contract, not Payload's wire shape. The generated types are reference for the cutover work and a tripwire for future schema drift.

---

## Task 2: Extend Reader with `getDepartment` (Decision B)

**Files:**
- Modify: `lib/content/types.ts`, `lib/content/reader.ts`, `lib/content/memory-reader.ts`, `lib/content/index.ts`.
- Modify: `tests/unit/content-reader.test.ts`, `tests/unit/content-memory-reader.test.ts`.

- [ ] **Step 1: Write failing tests first.**

Append to `tests/unit/content-memory-reader.test.ts`:

```ts
const ivfDept: BilingualDepartmentRecord = {
  id: 'dep-ivf',
  slug: { en: 'ivf', hi: 'aaivf' },
  name: { en: 'IVF & Reproductive Medicine', hi: 'आईवीएफ और प्रजनन चिकित्सा' },
  summary: {
    en: 'FOGSI-recognised infertility centre.',
    hi: 'FOGSI-मान्यता प्राप्त बाँझपन केंद्र।',
  },
};

describe('createMemoryReader — Department surface', () => {
  it('getDepartment returns Reader-resolved record for the locale', async () => {
    const reader = createMemoryReader({ departments: [ivfDept] });
    const result = await reader.getDepartment('ivf', 'en');
    expect(result?.name).toBe('IVF & Reproductive Medicine');
    expect(result?.summary).toBe('FOGSI-recognised infertility centre.');
  });

  it('getDepartment matches against the locale-localised slug', async () => {
    const reader = createMemoryReader({ departments: [ivfDept] });
    expect(await reader.getDepartment('aaivf', 'hi')).not.toBeNull();
    expect(await reader.getDepartment('aaivf', 'en')).toBeNull();
  });

  it('getDepartment returns null for an unknown slug', async () => {
    const reader = createMemoryReader({ departments: [ivfDept] });
    expect(await reader.getDepartment('nope', 'en')).toBeNull();
  });
});
```

Append to `tests/unit/content-reader.test.ts` (mirror the pattern with a Payload fake):

```ts
const ivfDoc = {
  id: 'dep-ivf',
  slug: 'ivf',
  name: 'IVF & Reproductive Medicine',
  summary: 'FOGSI-recognised infertility centre.',
};

describe('createReader — Department surface', () => {
  it('getDepartment queries Payload with localised slug filter and depth=0', async () => {
    const payload = fakePayload({ docs: [ivfDoc] });
    const reader = createReader(payload);
    await reader.getDepartment('ivf', 'en');
    const find = payload.find as unknown as ReturnType<typeof vi.fn>;
    expect(find).toHaveBeenCalledWith({
      collection: 'departments',
      where: { slug: { equals: 'ivf' } },
      locale: 'en',
      depth: 0,
      limit: 1,
    });
  });

  it('getDepartment maps Payload doc to Reader-resolved DepartmentRecord', async () => {
    const payload = fakePayload({ docs: [ivfDoc] });
    const reader = createReader(payload);
    const result = await reader.getDepartment('ivf', 'en');
    expect(result).toMatchObject({
      id: 'dep-ivf',
      slug: 'ivf',
      name: 'IVF & Reproductive Medicine',
      summary: 'FOGSI-recognised infertility centre.',
    });
  });

  it('getDepartment returns null when Payload returns no docs', async () => {
    const payload = fakePayload({ docs: [] });
    const reader = createReader(payload);
    expect(await reader.getDepartment('nope', 'en')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests; expect fails.**

```bash
pnpm test tests/unit/content-reader.test.ts tests/unit/content-memory-reader.test.ts
```

Expected: red — the new tests can't import `BilingualDepartmentRecord` and the methods don't exist.

- [ ] **Step 3: Implement.**

Append to `lib/content/types.ts`:
```ts
export type DepartmentRecord = {
  id: string;
  slug: string;
  name: string;
  summary: string;
};

export type BilingualDepartmentRecord = {
  id: string;
  slug: { en: string; hi: string };
  name: { en: string; hi: string };
  summary: { en: string; hi: string };
};
```

Modify `lib/content/reader.ts`:
- Add `getDepartment(slug, locale): Promise<DepartmentRecord | null>` to `ContentReader`.
- Add `getDepartment(slug): Promise<BilingualDepartmentRecord | null>` to `BilingualContentReader`.
- Implement both in `createReader`. Use `depth: 0` (no relations needed for the related-departments fallback; the page already has the slug from the Doctor relation).

Modify `lib/content/memory-reader.ts`:
- Add `departments?: BilingualDepartmentRecord[]` to `MemoryFixtures`.
- Implement `getDepartment(slug, locale)`: find by `d.slug[locale] === slug`, resolve to `DepartmentRecord`.
- Implement `withAllLocales().getDepartment(slug)`: find by either `d.slug.en === slug || d.slug.hi === slug`.

Modify `lib/content/index.ts`:
- Add `DepartmentRecord` and `BilingualDepartmentRecord` to the type re-exports.

- [ ] **Step 4: Run the tests; expect green.**

```bash
pnpm test tests/unit/content-reader.test.ts tests/unit/content-memory-reader.test.ts
```

- [ ] **Step 5: Typecheck + commit.**

```bash
pnpm typecheck
git add lib/content/ tests/unit/content-reader.test.ts tests/unit/content-memory-reader.test.ts
git commit -m "feat(content): add Department surface to ContentReader

getDepartment(slug, locale) for the related-departments fallback on
the Doctor detail page. depth=0 — no relations needed for this
embedding. Bilingual variant included for hreflang on Department
pages (Plan 4)."
```

---

## Task 3: Lexical helpers (Decision A)

**Files:**
- Create: `lib/content/lexical.ts`, `tests/unit/lexical.test.ts`.

- [ ] **Step 1: Write failing tests first.**

Create `tests/unit/lexical.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { lexicalToPlainText } from '@/lib/content/lexical';

describe('lexicalToPlainText', () => {
  it('returns empty string for null/undefined/non-object', () => {
    expect(lexicalToPlainText(null)).toBe('');
    expect(lexicalToPlainText(undefined)).toBe('');
    expect(lexicalToPlainText('hello')).toBe('');
    expect(lexicalToPlainText(42)).toBe('');
  });

  it('extracts text from a single paragraph', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'Hello world' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('Hello world');
  });

  it('joins multiple paragraphs with single spaces', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'First' }] },
          { type: 'paragraph', children: [{ text: 'Second' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('First Second');
  });

  it('walks nested children (e.g. text inside a heading)', () => {
    const node = {
      root: {
        children: [
          { type: 'heading', tag: 'h2', children: [{ text: 'Title' }] },
          {
            type: 'paragraph',
            children: [
              { text: 'Bold ' },
              { type: 'text', text: 'and italic.' },
            ],
          },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('Title Bold and italic.');
  });

  it('collapses whitespace runs', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: '  hello   world  ' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('hello world');
  });

  it('handles Hindi (Devanagari) text', () => {
    const node = {
      root: {
        children: [
          { type: 'paragraph', children: [{ text: 'डॉ. विमलेश शर्मा' }] },
        ],
      },
    };
    expect(lexicalToPlainText(node)).toBe('डॉ. विमलेश शर्मा');
  });
});
```

- [ ] **Step 2: Run; expect fails.**

- [ ] **Step 3: Implement.**

Create `lib/content/lexical.ts`:

```ts
/**
 * Walk a Lexical editor JSON tree and concatenate text nodes into a
 * single plain-text string. For schema.org JSON-LD `description`
 * fields where the bio is too long for a meta description anyway —
 * callers typically `.slice(0, 160)` the result.
 *
 * Tolerant of malformed input (returns empty string) so a stale
 * fixture or migration glitch doesn't take down the page.
 */
export function lexicalToPlainText(node: unknown): string {
  if (!node || typeof node !== 'object') return '';
  const parts: string[] = [];
  const root = (node as { root?: unknown }).root;
  if (root && typeof root === 'object') {
    walk(root, parts);
  } else {
    walk(node, parts);
  }
  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

function walk(node: unknown, parts: string[]): void {
  if (!node || typeof node !== 'object') return;
  const n = node as { text?: unknown; children?: unknown };
  if (typeof n.text === 'string' && n.text.length > 0) {
    parts.push(n.text);
  }
  if (Array.isArray(n.children)) {
    for (const child of n.children) walk(child, parts);
  }
}
```

- [ ] **Step 4: Run; expect green (6 tests).**

- [ ] **Step 5: Commit.**

```bash
git add lib/content/lexical.ts tests/unit/lexical.test.ts
git commit -m "feat(content): add lexicalToPlainText for JSON-LD descriptions

Walks a Lexical editor JSON tree and concatenates text nodes. Tolerant
of malformed input (returns ''); collapses whitespace; works for
Devanagari. Body rendering stays in @payloadcms/richtext-lexical/react's
RichText component — this helper is for the meta/JSON-LD path only."
```

---

## Task 4: JsonLd undefined guard

**Files:**
- Modify: `components/json-ld.tsx`.
- Create: `tests/unit/json-ld.test.tsx`.

> **Heads-up for the executor:** the editor environment has a security hook on `components/json-ld.tsx` because of its existing inline-script injection pattern. If the edit is blocked, surface that to the user immediately and ask for an override; do not workaround. The change is purely a safety guard added before the existing pipeline — no new escape-hatch is introduced.

- [ ] **Step 1: Write failing tests first.**

Create `tests/unit/json-ld.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { JsonLd } from '@/components/json-ld';

describe('JsonLd', () => {
  it('renders a script tag with escaped JSON for an object', () => {
    const html = renderToStaticMarkup(
      <JsonLd data={{ '@type': 'Hospital', name: 'A < B' }} />,
    );
    expect(html).toContain('application/ld+json');
    expect(html).toContain('"name":"A \\u003c B"');
    expect(html).not.toContain('<B');
  });

  it('returns null instead of crashing when data is undefined', () => {
    expect(() => renderToStaticMarkup(<JsonLd data={undefined} />)).not.toThrow();
    expect(renderToStaticMarkup(<JsonLd data={undefined} />)).toBe('');
  });

  it('returns null for symbol data (non-serialisable)', () => {
    const sym: unknown = Symbol('x');
    expect(() => renderToStaticMarkup(<JsonLd data={sym} />)).not.toThrow();
    expect(renderToStaticMarkup(<JsonLd data={sym} />)).toBe('');
  });

  it('returns null for function data (non-serialisable)', () => {
    const fn: unknown = () => 1;
    expect(() => renderToStaticMarkup(<JsonLd data={fn} />)).not.toThrow();
    expect(renderToStaticMarkup(<JsonLd data={fn} />)).toBe('');
  });
});
```

- [ ] **Step 2: Run; expect 1 pass + 3 fails (the existing object-render test passes; the three guard tests fail with a `TypeError` on `.replace`).**

- [ ] **Step 3: Modify `components/json-ld.tsx` to guard the JSON.stringify result.**

Apply this transformation to the `JsonLd` function (the existing `escapeForHtml` and the existing inline-script primitive both stay; only the early return is added):

1. Compute `const json = JSON.stringify(data);` first.
2. If `typeof json !== 'string'`, return `null`.
3. In dev/test only (`process.env.NODE_ENV !== 'production'`), `console.warn('JsonLd: data did not serialise to a string; skipping render', data);` before the `return null`. Add an `// eslint-disable-next-line no-console` directive on the `console.warn` line if eslint flags it.
4. Otherwise proceed with the existing `escapeForHtml(json)` + inline-script render path unchanged.

Update the function's leading JSDoc to note that builders returning a non-serialisable value will now silently skip render in production with a dev-only warning.

- [ ] **Step 4: Run; expect all 4 green.**

- [ ] **Step 5: Commit.**

```bash
git add components/json-ld.tsx tests/unit/json-ld.test.tsx
git commit -m "fix(json-ld): skip render instead of crashing on non-serialisable data

JSON.stringify(undefined) returns undefined, then escapeForHtml(undefined)
threw TypeError. Adversarial probe confirmed the crash was reachable
through the Locale Page Shells when a builder had an implicit-undefined
return path. Now: render null + dev-only warn. Adds 4 regression tests."
```

---

## Task 5: Cut over `/[locale]/patients/doctors/[slug]/page.tsx`

**Files:**
- Modify: `app/[locale]/patients/doctors/[slug]/page.tsx`.
- Test: existing `tests/e2e/home.spec.ts` and `tests/e2e/seo-header.spec.ts` cover this route — after the cutover, run both and confirm green. Also add a fresh assertion in Task 10's integration spec.

**Cutover shape (apply in one edit):**
- Replace `import { doctors, getDoctor }` with `import { getReader } from '@/lib/content'`.
- Replace `import { departments } from '@/content/data/departments'` — drop entirely; the related departments come from `d.departments` (now `DepartmentRef[]`) and per-department detail comes from `getReader().getDepartment(...)` if needed.
- Replace `import { pick } from '@/content/data/types'` — drop entirely; Reader-resolved records have flat strings.
- Add `import { localeDetailPage } from '@/lib/page-shells'`.
- Add `import { lexicalToPlainText } from '@/lib/content/lexical'`.
- Add `import { RichText } from '@payloadcms/richtext-lexical/react'` (verify the import path against the installed version's exports — Payload 3.84 exposes the React renderer at this path).
- Convert the page export to:

```tsx
export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const reader = await getReader();
  const tNav = await getTranslations('nav');
  const tActions = await getTranslations('actions');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  // Fetch related departments in parallel with the body render. The
  // doctor's `departments` field is DepartmentRef[] (id/slug/name only);
  // the related-departments section needs `summary`, so resolve each via
  // getDepartment(slug, locale). N+1 is bounded (typically 1-3).
  return localeDetailPage<DoctorRecord>({
    locale,
    fetch: () => reader.getDoctor(slug, locale),
    jsonLd: (d) =>
      physicianJsonLd({
        locale,
        slug: d.slug,
        name: d.name,
        specialty: d.specialty,
        qualifications: d.qualifications,
        bio: lexicalToPlainText(d.bio).slice(0, 160),
        image: d.image?.url,
      }),
    body: async (d) => {
      const departmentRecords = await Promise.all(
        d.departments.map((ref) => reader.getDepartment(ref.slug, locale)),
      );
      const doctorDepartments = departmentRecords.filter(
        (dep): dep is DepartmentRecord => dep !== null,
      );
      return (
        <>
          {/* hero + dl + bio + related-departments — copy the existing JSX
              tree, replacing pick(d.X, locale) with d.X, d.image with
              d.image?.url, dep.slug.en with dep.slug, pick(dep.name, locale)
              with dep.name, and pick(d.bio, locale) with
              <RichText data={d.bio as SerializedEditorState} /> */}
        </>
      );
    },
  });
}
```

- Update `generateStaticParams` to use the Reader:

```ts
export async function generateStaticParams() {
  const reader = await getReader();
  const slugs = await reader.listDoctorSlugs();
  return slugs.flatMap((slug) =>
    routing.locales.map((locale) => ({ locale, slug })),
  );
}
```

- Update `generateMetadata` to use the Reader (Doctor slug is not localised, so `getDoctor(slug, locale)` is sufficient — no `withAllLocales`):

```ts
export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const reader = await getReader();
  const d = await reader.getDoctor(slug, locale);
  if (!d) return {};
  return {
    title: d.name,
    description: d.specialty + '. ' + lexicalToPlainText(d.bio).slice(0, 160),
    alternates: {
      canonical: `/${locale}/patients/doctors/${d.slug}`,
      languages: hreflangAlternates({
        en: `/en/patients/doctors/${d.slug}`,
        hi: `/hi/patients/doctors/${d.slug}`,
      }),
    },
  };
}
```

- [ ] **Step 1: Apply the edits.**

- [ ] **Step 2: Run typecheck.**

```bash
pnpm typecheck
```

Expected: PASS. If `RichText`'s `data` prop expects a more specific type than `unknown`, cast at the call site (`d.bio as SerializedEditorState`) — do not loosen `DoctorRecord.bio: unknown` in `lib/content/types.ts`.

- [ ] **Step 3: Run the targeted Playwright spec for SEO + the home spec.**

```bash
pnpm exec playwright test tests/e2e/seo-header.spec.ts -g "doctor"
pnpm exec playwright test tests/e2e/home.spec.ts
```

Expected: PASS. If a JSON-LD assertion fails, check that `physicianJsonLd` still emits the expected shape (the `bio` and `image` fields now come from the Lexical helper and `d.image?.url`).

- [ ] **Step 4: Commit.**

```bash
git add app/[locale]/patients/doctors/[slug]/page.tsx
git commit -m "feat(doctors): cut detail page over to ContentReader + localeDetailPage

The doctor detail page now reads through getReader() instead of the
content/data/doctors fixtures. Bio renders via RichText; JSON-LD
description uses lexicalToPlainText. Related departments are resolved
via getDepartment(slug, locale) (bounded N+1). generateStaticParams
and generateMetadata also flipped over."
```

---

## Task 6: Cut over `/[locale]/patients/doctors/page.tsx` (list)

**Files:**
- Modify: `app/[locale]/patients/doctors/page.tsx`, `app/[locale]/patients/doctors/doctors-browser.tsx`.

The list page already does a `doctors.map(...)` to project to `DoctorRow` for the client browser. The cutover replaces the source array.

- [ ] **Step 1: Apply edits to the list page.**

- Replace `import { doctors } from '@/content/data/doctors'` and `import { departments } from '@/content/data/departments'` with `import { getReader } from '@/lib/content'`.
- Replace `import { pick } from '@/content/data/types'` — drop.
- Wrap the page with `localeListPage<DoctorRecord>({ locale, list: () => reader.listDoctors(locale), body: ... })` — or, if the page's hub structure makes the shell awkward, leave the shell off and just swap data. **Recommend** wrapping with `localeListPage` so this surface uses Plan 1's infrastructure.
- Inside `body`, project to `DoctorRow`:

```ts
const rows: DoctorRow[] = records.map((d) => ({
  slug: d.slug,
  name: d.name,
  specialty: d.specialty,
  qualifications: d.qualifications,
  languages: d.languages.join(', '),
  opdDays: d.opdDays ?? '',
  departments: d.departments.map((dep) => dep.slug),
  image: d.image?.url ?? null,
}));
```

- For the department filter chips, derive from the union of `d.departments` across all loaded doctors (no extra fetches needed):

```ts
const departmentOptions = Array.from(
  new Map(
    records
      .flatMap((d) => d.departments)
      .map((dep) => [dep.slug, { slug: dep.slug, name: dep.name }]),
  ).values(),
);
```

- [ ] **Step 2: Apply edits to `doctors-browser.tsx`.**

The `DoctorRow` shape is unchanged externally — `image: string | null` stays. No edits needed unless the existing browser also depends on `pick` (it doesn't; it's a client component receiving plain props). Verify by re-reading the file.

- [ ] **Step 3: Typecheck + targeted Playwright.**

```bash
pnpm typecheck
pnpm exec playwright test tests/e2e/home.spec.ts -g "doctors"
pnpm exec playwright test tests/e2e/ui-ux.spec.ts -g "doctors"
```

- [ ] **Step 4: Commit.**

```bash
git add app/[locale]/patients/doctors/page.tsx app/[locale]/patients/doctors/doctors-browser.tsx
git commit -m "feat(doctors): cut list page over to ContentReader + localeListPage

Doctor list and the doctors-browser now consume Reader output.
Department filter chips are derived from the union of the loaded
doctors' DepartmentRef[] (no extra fetches)."
```

---

## Task 7: Cut over `/[locale]/page.tsx` (home — featured doctors section)

**Files:**
- Modify: `app/[locale]/page.tsx`.

The home page is a complex composite (uses doctors + departments + news + hospitalJsonLd). **Don't** wrap it in a shell — its surface doesn't fit `localeDetailPage`/`localeListPage`/`localeStaticPage` cleanly. Just swap the doctor data source.

- [ ] **Step 1: Apply edits.**

- Replace `import { doctors }` with `import { getReader } from '@/lib/content'`.
- Inside `HomePage`, change `const featuredDoctors = doctors.slice(0, 8)` to `const featuredDoctors = (await reader.listDoctors(locale)).slice(0, 8)` (where `const reader = await getReader();` is hoisted to the top of the function).
- Adapt the JSX that consumed `pick(d.name, locale)` → `d.name`, `d.image` → `d.image?.url`, etc.
- **Do not** touch the `departments` or `news` data sources in this plan — they stay on `content/data` until Plans 3 and 4.

- [ ] **Step 2: Typecheck + home spec.**

```bash
pnpm typecheck
pnpm exec playwright test tests/e2e/home.spec.ts
pnpm exec playwright test tests/e2e/visual.spec.ts
```

If the visual regression catches a layout drift (e.g. image proportions changed because `d.image?.url ?? '/...'` resolves differently), update with `--update-snapshots` only after eyeballing the diff.

- [ ] **Step 3: Commit.**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(home): swap featured doctors source to ContentReader

Home page reads featuredDoctors via getReader().listDoctors(locale).
Departments + news still come from content/data; covered by Plans
3 and 4."
```

---

## Task 8: Cut over `/[locale]/patients/departments/[slug]/page.tsx` (doctor list)

**Files:**
- Modify: `app/[locale]/patients/departments/[slug]/page.tsx`.

This page lists doctors via the legacy `getDoctorsByDepartment(slug)`. Cut over only the doctor call; leave the department side on `content/data` (Plan 4).

- [ ] **Step 1: Apply edits.**

- Add `import { getReader } from '@/lib/content'`.
- Replace `import { getDoctorsByDepartment } from '@/content/data/doctors'` — drop.
- Inside the page: `const doctorsHere = await (await getReader()).getDoctorsByDepartment(dept.slug.en, locale);`
- Adapt the JSX (`d.name`, `d.specialty`, `d.image?.url`).

- [ ] **Step 2: Typecheck + targeted spec.**

```bash
pnpm typecheck
pnpm exec playwright test tests/e2e/home.spec.ts -g "department"
```

- [ ] **Step 3: Commit.**

```bash
git add app/[locale]/patients/departments/[slug]/page.tsx
git commit -m "feat(departments): swap doctor list to ContentReader.getDoctorsByDepartment

Department detail page's doctor sub-list now reads through the Reader.
Department record itself still comes from content/data; covered by
Plan 4."
```

---

## Task 9: Cut over `/[locale]/academics/faculty/page.tsx`

**Files:**
- Modify: `app/[locale]/academics/faculty/page.tsx`.

The faculty page treats senior consultants as faculty (per the in-file comment). Same shape as Task 7.

- [ ] **Step 1: Apply edits.**

- Replace `import { doctors }` with `import { getReader } from '@/lib/content'`.
- `const faculty = await (await getReader()).listDoctors(locale);`
- Adapt JSX field accesses.

- [ ] **Step 2: Typecheck + a11y spec for the faculty route (verify nothing axe-worthy regressed).**

```bash
pnpm typecheck
pnpm exec playwright test tests/e2e/a11y.spec.ts -g "faculty"
```

- [ ] **Step 3: Commit.**

```bash
git add app/[locale]/academics/faculty/page.tsx
git commit -m "feat(faculty): swap faculty list to ContentReader.listDoctors

Faculty page (which treats senior consultants as faculty until a
dedicated Faculty collection is wired in Plan 4) now reads through
the Reader."
```

---

## Task 10: Real-Payload integration test (Decision C)

**Files:**
- Create: `tests/e2e/doctor-cutover.spec.ts`.

This spec exists to catch the class of bug that the existing mock-only Reader tests can't: a query shape that's syntactically valid but semantically wrong (e.g. Payload doesn't actually populate the relationship through `'departments.slug'` dot-notation, so `getDoctorsByDepartment` returns 0 doctors in production despite all unit tests passing).

- [ ] **Step 1: Write the spec.**

Create `tests/e2e/doctor-cutover.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

/**
 * Real-Payload integration smoke. Asserts that the Doctor pages
 * cut over in this plan actually render seeded data from Postgres
 * via the ContentReader → Payload → Postgres pipeline. Failure
 * here (when the suite went green pre-cutover) means the Reader's
 * query shape is wrong against the real Payload runtime, not the
 * mocked one used in unit tests.
 *
 * Requires: `pnpm docker:dev` running and `pnpm seed` completed.
 */

const DOCTORS_TO_VERIFY = [
  {
    slug: 'vimlesh-sharma',
    en: { name: 'Dr. Vimlesh Sharma', specialty: 'IVF and Reproductive Medicine' },
    hi: { name: 'डॉ. विमलेश शर्मा', specialty: 'आईवीएफ और प्रजनन चिकित्सा' },
  },
  {
    slug: 'sanjay-rai',
    en: { name: 'Dr. Sanjay Rai', specialty: 'Neurosurgery' },
    hi: { name: 'डॉ. संजय राय', specialty: 'न्यूरोसर्जरी' },
  },
];

for (const doctor of DOCTORS_TO_VERIFY) {
  for (const locale of ['en', 'hi'] as const) {
    test(`Reader-fed doctor detail renders ${doctor.slug} in ${locale}`, async ({ page }) => {
      await page.goto(`/${locale}/patients/doctors/${doctor.slug}`);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(doctor[locale].name);
      await expect(page.locator('body')).toContainText(doctor[locale].specialty);
      const ldText = await page.locator('script[type="application/ld+json"]').first().textContent();
      const ld = JSON.parse(ldText ?? '{}');
      expect(ld['@type']).toBe('Physician');
      expect(ld.name).toBe(doctor[locale].name);
    });
  }
}

test('Reader-fed doctor list renders seeded doctors in both locales', async ({ page }) => {
  for (const locale of ['en', 'hi'] as const) {
    await page.goto(`/${locale}/patients/doctors`);
    for (const d of DOCTORS_TO_VERIFY) {
      await expect(page.getByRole('link', { name: d[locale].name })).toBeVisible();
    }
  }
});

test('Reader-fed department doctor list renders matching doctors', async ({ page }) => {
  await page.goto('/en/patients/departments/cardiology');
  await expect(page.locator('body')).toContainText('Pramod Teotia');
});
```

- [ ] **Step 2: Run the spec.**

```bash
# Ensure Docker dev + seed are running.
pnpm exec playwright test tests/e2e/doctor-cutover.spec.ts
```

Expected: PASS. If it fails:

- **0 doctors returned for `getDoctorsByDepartment`** → the `'departments.slug'` filter doesn't work as written against Payload 3.84. Fix in `lib/content/reader.ts` (try `'departments.value.slug'`, or filter by relation ID). Re-run unit tests, re-run this spec.
- **Hindi name on the EN page (or vice versa)** → the locale isn't being threaded through the find call. Re-check the `locale` param.
- **Payload error about `select`** → drop `select: { slug: true }` from `listDoctorSlugs` and pull all fields. Update the unit test accordingly.

- [ ] **Step 3: Add the script to `package.json` for narrow loops.**

```json
"test:e2e:cutover": "playwright test tests/e2e/doctor-cutover.spec.ts"
```

- [ ] **Step 4: Commit.**

```bash
git add tests/e2e/doctor-cutover.spec.ts package.json
git commit -m "test(e2e): add real-Payload integration smoke for Doctor cutover

Asserts the ContentReader → Payload → Postgres pipeline actually
returns seeded data when the Doctor detail / list / by-department
pages render. Fixes the gap that mock-only Reader unit tests
couldn't catch (e.g. wrong relationship-filter dot-path)."
```

---

## Task 11: Final verification + merge

**Files:** none. Pure verification.

- [ ] **Step 1: Full pyramid.**

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm exec playwright test
```

Expected:
- typecheck PASS
- lint PASS
- vitest: all green except possibly the pre-existing `security.test.ts` failure carried over from `main`'s uncommitted state — **not our problem**, document it in the merge commit note if it's still red.
- Playwright: all green; the new `doctor-cutover.spec.ts` joins the suite. Visual snapshots may need a single `--update-snapshots` pass if real photography subbed in for the placeholder; check the diff before accepting.

- [ ] **Step 2: Deletion test.**

`rg "from '@/content/data/doctors'" app/` should return zero matches in `app/**`. The remaining importer is `lib/search.ts` (Plan 5).

- [ ] **Step 3: Convergence check (mini adversarial).**

For each consumer cut over:
- Does the page still render the same visible content for both locales?
- Does the JSON-LD still parse and contain `@type: Physician`?
- Does hreflang point to the same slug in both locales (Doctor slug isn't localised)?

If any answer is no, fix before merging.

- [ ] **Step 4: Merge to main.**

```bash
cd ../..    # back to main worktree
git merge --no-ff feature/doctor-cutover -m "Merge feature/doctor-cutover into main"
pnpm test    # confirm nothing broke
git worktree remove .worktrees/doctor-cutover
git branch -d feature/doctor-cutover
```

- [ ] **Step 5: Update phase ledger in `CLAUDE.md`.**

Add to §5.8:

```
| 11. Doctor cutover | done | All Doctor consumers in app/** read via ContentReader. content/data/doctors.ts retained for the search lib (Plan 5) and the seeder. payload-types.ts now committed as schema source of truth. |
```

---

## Self-review (per writing-plans skill)

**1. Spec coverage.** Each adversarial finding from the post-Plan-1 convergence report maps to a task:

- Adversarial #1 (schema drift) → Task 1 (codegen pins the truth) + Task 2 (DepartmentRef gap closed via `getDepartment`).
- Adversarial #2 (consumer dry-run blockers) → Tasks 3 (Lexical helpers), 5–9 (per-consumer cutovers).
- Adversarial #3 (JsonLd undefined crash) → Task 4.
- Adversarial #4 (singleton mock pollution) → already fixed on `main` before this plan started.
- Adversarial #5 (`withAllLocales` dead weight for Doctor) → acknowledged in plan body; no task (kept for forward use in Plan 4).
- Adversarial #6 (search lib bilingual `listDoctors`) → out of scope; flagged for Plan 5.
- Adversarial #7 (memory vs real fixture asymmetry) → addressed implicitly by Task 10 (real-Payload spec catches what mock-only fixtures can't).
- Adversarial #8 (zero runtime consumers) → resolved by Tasks 5–9.

**2. Placeholder scan.** Every code step contains real code or a precise transformation rule. The Task 5 body is sketched (the JSX tree is large and the cutover rule is mechanical: `pick(X, locale)` → `X`, `X.image` → `X.image?.url`); the executor reads the existing file, applies the rule, and the typechecker enforces correctness.

**3. Type consistency.** All references to `DoctorRecord`, `DepartmentRecord`, `DepartmentRef`, `MediaRecord`, and `BilingualDepartmentRecord` are stable across tasks. `getDepartment(slug, locale)` and `withAllLocales().getDepartment(slug)` use the same signatures throughout.

**4. Test fixture realism.** Real institutional names from the seed corpus (Vimlesh Sharma, Sanjay Rai, Pramod Teotia) flow through the integration spec. The Hindi names are the actual Devanagari transliterations from `content/data/doctors.ts`.

---

## What this plan does NOT do

- **`lib/search.ts` cutover.** Plan 5 — needs a `BilingualContentReader.listDoctors()` addition.
- **News, Department, Program, Faculty, Page, Location data surfaces.** Plans 3 and 4.
- **Removal of `content/data/doctors.ts`.** Stays until the search lib and the seeder migrate (Plans 5 + the eventual seeder retirement when the admin UI becomes the canonical authoring surface).
- **Real photography swap.** Per `CLAUDE.md` §5.8 phase 6, post-launch.
