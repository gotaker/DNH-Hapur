import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { RichText } from '@payloadcms/richtext-lexical/react';
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { getReader } from '@/lib/content';
import type { DepartmentRecord, DoctorRecord } from '@/lib/content';
import { localeDetailPage } from '@/lib/page-shells';
import { lexicalToPlainText } from '@/lib/content/lexical';
import { hreflangAlternates, physicianJsonLd } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';

export async function generateStaticParams() {
  const reader = await getReader();
  const slugs = await reader.listDoctorSlugs();
  return slugs.flatMap((slug) =>
    routing.locales.map((locale) => ({ locale, slug })),
  );
}

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
          <section className="rule-bottom bg-surface">
            <div className="container-wide grid gap-12 py-section lg:grid-cols-[1fr_1.4fr]">
              <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
                {d.image ? (
                  <Image
                    src={d.image.url}
                    alt={d.image.alt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover"
                    priority
                  />
                ) : null}
              </div>
              <div className="flex flex-col justify-end">
                <Link
                  href="/patients/doctors"
                  className="text-ink-mute hover:text-brand text-xs font-medium tracking-wide"
                >
                  ← {tNav('doctors')}
                </Link>
                <h1 className="font-display text-ink mt-4 text-5xl leading-[1.05] tracking-tight">
                  {d.name}
                </h1>
                <p className="text-ink-mute mt-3 text-lg">{d.specialty}</p>
                <p className="text-ink-soft mt-1 font-mono text-xs uppercase tracking-wider">
                  {d.qualifications}
                </p>

                <dl className="border-rule mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6 sm:grid-cols-3">
                  <div>
                    <dt className="eyebrow text-ink-mute">OPD</dt>
                    <dd className="text-ink mt-1 text-sm">{d.opdDays ?? ''}</dd>
                  </div>
                  <div>
                    <dt className="eyebrow text-ink-mute">{t('Languages', 'भाषाएँ')}</dt>
                    <dd className="text-ink mt-1 text-sm">{d.languages.join(', ')}</dd>
                  </div>
                  {d.registration ? (
                    <div>
                      <dt className="eyebrow text-ink-mute">{t('Registration', 'पंजीकरण')}</dt>
                      <dd className="text-ink mt-1 font-mono text-sm">{d.registration}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="text-ink mt-10 max-w-prose text-base leading-relaxed">
                  <RichText data={d.bio as SerializedEditorState} />
                </div>

                <div className="mt-10 flex flex-wrap gap-3">
                  <Button asChild size="lg">
                    <Link href="/contact">{tActions('bookAppointment')}</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/patients/doctors">
                      {t('All physicians', 'सभी चिकित्सक')} →
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {doctorDepartments.length > 0 ? (
            <section className="bg-surface-mute">
              <div className="container-wide py-section">
                <span className="eyebrow text-brand">{t('Departments', 'विभाग')}</span>
                <ul className="mt-6 grid gap-x-12 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                  {doctorDepartments.map((dep) => (
                    <li key={dep.slug}>
                      <Link
                        href={`/patients/departments/${dep.slug}`}
                        className="font-display text-ink hover:text-brand text-2xl transition-colors"
                      >
                        {dep.name}
                      </Link>
                      <p className="text-ink-mute mt-2 text-sm leading-relaxed">
                        {dep.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ) : null}
        </>
      );
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
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
