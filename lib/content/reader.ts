import type { Payload } from 'payload';
import type { Locale } from '@/i18n/routing';
import type { BilingualDoctorRecord, DepartmentRef, DoctorRecord, MediaRecord } from './types';

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
  getDoctorsByDepartment(departmentSlug: string, locale: Locale): Promise<DoctorRecord[]>;
  /** All doctor slugs (not localised). Used by `generateStaticParams`. */
  listDoctorSlugs(): Promise<string[]>;
  /** Bilingual escape hatch — for hreflang + parallel-slug callers. */
  withAllLocales(): BilingualContentReader;
};

// ---------- Field unwrapping helpers ----------

function unwrapArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object' && 'item' in entry) {
        const item = (entry as { item: unknown }).item;
        return typeof item === 'string' ? item : null;
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

// Both helpers below assume `depth >= 1` in the calling find(); a string-ID input
// (the depth=0 shape) intentionally maps to null / [] so the absence of population
// is visible rather than masked.
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

function requireId(value: unknown, where: string): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  throw new Error(`ContentReader: missing or non-scalar id in ${where}`);
}

function mapDoctor(doc: unknown): DoctorRecord {
  const d = doc as Record<string, unknown>;
  return {
    id: requireId(d.id, 'mapDoctor'),
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
  const specialty = (d.specialty ?? { en: '', hi: '' }) as {
    en: unknown;
    hi: unknown;
  };
  const opdDays = (d.opdDays ?? { en: null, hi: null }) as {
    en: unknown;
    hi: unknown;
  };
  const bio = (d.bio ?? { en: null, hi: null }) as {
    en: unknown;
    hi: unknown;
  };
  return {
    id: requireId(d.id, 'mapBilingualDoctor'),
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
    // limit: 1000 is sized for current institutional scale (one hospital,
    // ~tens-to-low-hundreds of doctors). Revisit if any collection nears 500.
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
