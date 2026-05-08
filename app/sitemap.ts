import type { MetadataRoute } from 'next';
import { departments } from '@/content/data/departments';
import { doctors } from '@/content/data/doctors';
import { programs } from '@/content/data/programs';
import { news } from '@/content/data/news';
import { absoluteUrl } from '@/lib/seo';
import { routing } from '@/i18n/routing';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [];

  const staticPaths = [
    '',
    '/patients',
    '/patients/departments',
    '/patients/doctors',
    '/patients/emergency',
    '/academics',
    '/academics/programs',
    '/academics/admissions',
    '/academics/faculty',
    '/academics/research',
    '/about',
    '/news',
    '/contact',
    '/search',
  ];

  for (const locale of routing.locales) {
    for (const p of staticPaths) {
      entries.push({
        url: absoluteUrl(`/${locale}${p}`),
        lastModified: now,
        changeFrequency: 'weekly',
      });
    }
  }

  for (const locale of routing.locales) {
    for (const d of departments) {
      entries.push({
        url: absoluteUrl(`/${locale}/patients/departments/${d.slug[locale]}`),
        lastModified: now,
        changeFrequency: 'monthly',
      });
    }
    for (const doc of doctors) {
      entries.push({
        url: absoluteUrl(`/${locale}/patients/doctors/${doc.slug}`),
        lastModified: now,
        changeFrequency: 'monthly',
      });
    }
    for (const p of programs) {
      entries.push({
        url: absoluteUrl(`/${locale}/academics/programs/${p.slug[locale]}`),
        lastModified: now,
        changeFrequency: 'monthly',
      });
    }
    for (const n of news) {
      entries.push({
        url: absoluteUrl(`/${locale}/news/${n.slug}`),
        lastModified: new Date(n.date),
        changeFrequency: 'yearly',
      });
    }
  }

  return entries;
}
