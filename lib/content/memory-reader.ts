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
