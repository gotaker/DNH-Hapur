import { site } from './site';
import type { Locale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

/** Build absolute URL for a path. */
export function absoluteUrl(path: string): string {
  if (path.startsWith('http')) return path;
  const base = site.url.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

/** Generate hreflang alternates for a path that has a parallel localised version. */
export function hreflangAlternates(localisedPaths: Record<Locale, string>) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    const path = localisedPaths[locale];
    if (path) {
      const tag = locale === 'hi' ? 'hi-IN' : 'en-IN';
      languages[tag] = absoluteUrl(path);
    }
  }
  // x-default → Hindi (institution default).
  languages['x-default'] = absoluteUrl(localisedPaths.hi);
  return languages;
}

/** Hospital schema for the home page. */
export function hospitalJsonLd(locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': ['Hospital', 'EducationalOrganization'],
    name: site.name[locale],
    alternateName: site.name[locale === 'hi' ? 'en' : 'hi'],
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl('/icon.svg'),
    foundingDate: String(site.established),
    telephone: site.emergencyPhone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: locale === 'hi' ? 'गढ़ रोड' : 'Garh Road',
      addressLocality: 'Hapur',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    medicalSpecialty: [
      'Cardiology',
      'Neurosurgery',
      'Reproductive medicine',
      'Neonatal intensive care',
      'Joint replacement',
    ],
    availableService: [
      { '@type': 'EmergencyService', name: 'Emergency, 24x7' },
      { '@type': 'BloodBank', name: 'Licensed blood bank, 24x7' },
    ],
  };
}

/** Physician schema for a doctor profile. */
export function physicianJsonLd(args: {
  locale: Locale;
  slug: string;
  name: string;
  specialty: string;
  qualifications: string;
  bio: string;
  image?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Physician',
    name: args.name,
    medicalSpecialty: args.specialty,
    description: args.bio,
    url: absoluteUrl(`/${args.locale}/patients/doctors/${args.slug}`),
    image: args.image,
    additionalName: args.qualifications,
    worksFor: {
      '@type': 'Hospital',
      name: site.name[args.locale],
      url: absoluteUrl(`/${args.locale}`),
    },
  };
}

/** Department / specialty schema. */
export function medicalSpecialtyJsonLd(args: {
  locale: Locale;
  slug: string;
  name: string;
  summary: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalSpecialty',
    name: args.name,
    description: args.summary,
    url: absoluteUrl(`/${args.locale}/patients/departments/${args.slug}`),
    parentOrganization: {
      '@type': 'Hospital',
      name: site.name[args.locale],
      url: absoluteUrl(`/${args.locale}`),
    },
  };
}

/** Program / NewsArticle / breadcrumbs. */
export function newsArticleJsonLd(args: {
  locale: Locale;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: args.title,
    description: args.excerpt,
    datePublished: args.date,
    url: absoluteUrl(`/${args.locale}/news/${args.slug}`),
    publisher: {
      '@type': 'Organization',
      name: site.name[args.locale],
      url: absoluteUrl(`/${args.locale}`),
    },
  };
}

export function breadcrumbsJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.url),
    })),
  };
}
