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
