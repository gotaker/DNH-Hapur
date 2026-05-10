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
