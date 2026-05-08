/**
 * Payload seeder.
 *
 * Pumps the `content/data/*` static fixtures into a freshly-migrated
 * Payload database. Run after `pnpm payload migrate` once the database is up.
 *
 *   pnpm seed
 *
 * Idempotent on slug; re-running updates instead of duplicating.
 */
import { getPayload, type Where } from 'payload';
import config from '../payload.config';
import { departments } from '../content/data/departments';
import { doctors } from '../content/data/doctors';
import { programs } from '../content/data/programs';
import { news } from '../content/data/news';
import { site } from '../lib/site';

async function upsert(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: string,
  where: Where,
  data: Record<string, unknown>,
  locale: 'en' | 'hi',
) {
  const existing = await payload.find({
    collection,
    where,
    locale,
    depth: 0,
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({
      collection,
      id: existing.docs[0].id,
      data,
      locale,
    });
    return existing.docs[0].id;
  }
  const created = await payload.create({ collection, data, locale });
  return created.id;
}

async function main() {
  const payload = await getPayload({ config });

  // Settings global — bilingual.
  for (const locale of ['en', 'hi'] as const) {
    await payload.updateGlobal({
      slug: 'settings',
      locale,
      data: {
        siteName: site.name[locale],
        shortName: site.shortName[locale],
        emergencyPhone: site.emergencyPhone,
        phones: site.phones.map((number) => ({ number })),
        email: site.email,
        whatsapp: site.whatsapp,
      },
    });
  }

  // Departments — write English first so the doc exists, then layer Hindi.
  const deptIdBySlug = new Map<string, string | number>();
  for (const d of departments) {
    const id = await upsert(
      payload,
      'departments',
      { 'slug': { equals: d.slug.en } },
      {
        name: d.name.en,
        slug: d.slug.en,
        summary: d.summary.en,
        services: d.services.en.map((item) => ({ item })),
        isCenter: Boolean(d.isCenter),
      },
      'en',
    );
    await payload.update({
      collection: 'departments',
      id,
      data: {
        name: d.name.hi,
        slug: d.slug.hi,
        summary: d.summary.hi,
        services: d.services.hi.map((item) => ({ item })),
      },
      locale: 'hi',
    });
    deptIdBySlug.set(d.slug.en, id);
  }

  // Doctors.
  for (const doc of doctors) {
    const departmentIds = doc.departments
      .map((s) => deptIdBySlug.get(s))
      .filter((v): v is string | number => Boolean(v));
    const id = await upsert(
      payload,
      'doctors',
      { slug: { equals: doc.slug } },
      {
        name: doc.name.en,
        slug: doc.slug,
        qualifications: doc.qualifications,
        specialty: doc.specialty.en,
        departments: departmentIds,
        languages: doc.languages.en.map((item) => ({ item })),
        opdDays: doc.opdDays.en,
        registration: doc.registration,
      },
      'en',
    );
    await payload.update({
      collection: 'doctors',
      id,
      data: {
        name: doc.name.hi,
        specialty: doc.specialty.hi,
        languages: doc.languages.hi.map((item) => ({ item })),
        opdDays: doc.opdDays.hi,
      },
      locale: 'hi',
    });
  }

  // Programs.
  for (const p of programs) {
    const id = await upsert(
      payload,
      'programs',
      { slug: { equals: p.slug.en } },
      {
        title: p.title.en,
        slug: p.slug.en,
        level: p.level,
        duration: p.duration.en,
        intake: p.intake,
        eligibility: p.eligibility.en.map((item) => ({ item })),
        feeIndicative: p.feeIndicative.en,
        accreditation: p.accreditation,
        summary: p.summary.en,
      },
      'en',
    );
    await payload.update({
      collection: 'programs',
      id,
      data: {
        title: p.title.hi,
        slug: p.slug.hi,
        duration: p.duration.hi,
        eligibility: p.eligibility.hi.map((item) => ({ item })),
        feeIndicative: p.feeIndicative.hi,
        summary: p.summary.hi,
      },
      locale: 'hi',
    });
  }

  // News.
  for (const n of news) {
    const id = await upsert(
      payload,
      'news',
      { slug: { equals: n.slug } },
      {
        title: n.title.en,
        slug: n.slug,
        category: n.category.en,
        publishedAt: n.date,
        excerpt: n.excerpt.en,
      },
      'en',
    );
    await payload.update({
      collection: 'news',
      id,
      data: {
        title: n.title.hi,
        category: n.category.hi,
        excerpt: n.excerpt.hi,
      },
      locale: 'hi',
    });
  }

  console.log('[seed] done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
