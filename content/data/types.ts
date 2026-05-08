import type { Locale } from '@/i18n/routing';

/** A copy field that exists in both supported locales. */
export type Localized<T = string> = Record<Locale, T>;

/** Look up a localized field for the active locale, falling back to English. */
export function pick<T>(value: Localized<T>, locale: Locale): T {
  return value[locale] ?? value.en;
}

export interface Department {
  slug: Localized<string>;
  name: Localized<string>;
  shortName?: Localized<string>;
  summary: Localized<string>;
  services: Localized<string[]>;
  hod?: string; // doctor slug
  image?: string;
  isCenter?: boolean;
}

export interface Doctor {
  slug: string;
  name: Localized<string>;
  qualifications: string;
  specialty: Localized<string>;
  departments: string[]; // department en-slug
  languages: Localized<string[]>;
  opdDays: Localized<string>;
  bio: Localized<string>;
  registration?: string;
  image?: string;
}

export interface CenterOfExcellence {
  slug: string;
  title: Localized<string>;
  eyebrow: Localized<string>;
  body: Localized<string>;
  capabilities: Localized<string[]>;
  image: string;
  imageAlt: Localized<string>;
}

export interface NewsItem {
  slug: string;
  date: string; // ISO yyyy-mm-dd
  title: Localized<string>;
  excerpt: Localized<string>;
  body: Localized<string>;
  category: Localized<string>;
}

export interface Program {
  slug: Localized<string>;
  title: Localized<string>;
  level: 'undergraduate' | 'postgraduate' | 'fellowship' | 'paramedical' | 'training';
  duration: Localized<string>;
  intake: number;
  eligibility: Localized<string[]>;
  feeIndicative: Localized<string>;
  accreditation: string;
  summary: Localized<string>;
}
