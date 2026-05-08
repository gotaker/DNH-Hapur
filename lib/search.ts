import { departments } from '@/content/data/departments';
import { doctors } from '@/content/data/doctors';
import { programs } from '@/content/data/programs';
import type { Locale } from '@/i18n/routing';

/**
 * In-process bilingual search across the static content corpus.
 *
 * This is the phase 7 stand-in for the production Postgres `pg_trgm`
 * search. The shape of the result set is the same (hit rows with a
 * `kind`, `slug`, `title`, `subtitle`, and `score`), so the UI can
 * be wired to either backend without churn.
 */
export type SearchKind = 'doctor' | 'department' | 'program';

export interface SearchHit {
  kind: SearchKind;
  slug: string;
  title: string;
  subtitle: string;
  href: string;
  score: number;
}

const normalise = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

function score(query: string, haystack: string): number {
  if (!query) return 0;
  const q = normalise(query);
  const h = normalise(haystack);
  if (!h) return 0;

  if (h === q) return 1;
  if (h.startsWith(q)) return 0.85;
  // Word-boundary match.
  const re = new RegExp(`(?:^|\\s)${escapeRegExp(q)}`);
  if (re.test(h)) return 0.7;
  if (h.includes(q)) return 0.55;
  return 0;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function searchAll(query: string, locale: Locale, limit = 12): SearchHit[] {
  if (!query || query.trim().length < 2) return [];

  const hits: SearchHit[] = [];

  for (const d of doctors) {
    const haystack = [
      d.name.en,
      d.name.hi,
      d.specialty.en,
      d.specialty.hi,
      d.qualifications,
    ].join(' \u2022 ');
    const s = score(query, haystack);
    if (s > 0) {
      hits.push({
        kind: 'doctor',
        slug: d.slug,
        title: d.name[locale],
        subtitle: d.specialty[locale],
        href: `/${locale}/patients/doctors/${d.slug}`,
        score: s + 0.05,
      });
    }
  }

  for (const dep of departments) {
    const haystack = [
      dep.name.en,
      dep.name.hi,
      dep.summary.en,
      dep.summary.hi,
      ...dep.services.en,
      ...dep.services.hi,
    ].join(' \u2022 ');
    const s = score(query, haystack);
    if (s > 0) {
      hits.push({
        kind: 'department',
        slug: dep.slug.en,
        title: dep.name[locale],
        subtitle: dep.summary[locale].slice(0, 120),
        href: `/${locale}/patients/departments/${dep.slug[locale]}`,
        score: s,
      });
    }
  }

  for (const p of programs) {
    const haystack = [
      p.title.en,
      p.title.hi,
      p.summary.en,
      p.summary.hi,
      p.accreditation,
    ].join(' \u2022 ');
    const s = score(query, haystack);
    if (s > 0) {
      hits.push({
        kind: 'program',
        slug: p.slug.en,
        title: p.title[locale],
        subtitle: p.summary[locale].slice(0, 120),
        href: `/${locale}/academics/programs/${p.slug[locale]}`,
        score: s - 0.05,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}
