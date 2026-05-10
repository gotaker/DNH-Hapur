import { notFound } from 'next/navigation';
import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { departments, getDepartmentBySlug } from '@/content/data/departments';
import { getReader } from '@/lib/content';
import { pick } from '@/content/data/types';
import { hreflangAlternates, medicalSpecialtyJsonLd } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';
import { site } from '@/lib/site';

export function generateStaticParams() {
  return departments.flatMap((d) =>
    routing.locales.map((locale) => ({ locale, slug: d.slug[locale] })),
  );
}

export default async function DepartmentDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const dept = getDepartmentBySlug(slug);
  if (!dept) notFound();

  const t = await getTranslations('nav');
  const tActions = await getTranslations('actions');
  const reader = await getReader();
  const doctorsHere = await reader.getDoctorsByDepartment(dept.slug.en, locale);

  return (
    <>
      <JsonLd
        data={medicalSpecialtyJsonLd({
          locale,
          slug: dept.slug[locale],
          name: pick(dept.name, locale),
          summary: pick(dept.summary, locale),
        })}
      />
      <section className="rule-bottom bg-surface">
        <div className="container-wide grid gap-10 py-section lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <Link
              href="/patients/departments"
              className="text-ink-mute hover:text-brand text-xs font-medium tracking-wide"
            >
              ← {t('departments')}
            </Link>
            <h1 className="font-display text-ink mt-6 text-5xl leading-[1.05] tracking-tight">
              {pick(dept.name, locale)}
            </h1>
            <p className="text-ink-mute mt-6 max-w-prose text-lg leading-relaxed">
              {pick(dept.summary, locale)}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/contact">{tActions('bookAppointment')}</Link>
              </Button>
              <a
                href={`tel:${site.emergencyPhone}`}
                className="text-ink hover:text-brand text-sm font-medium tracking-wide"
              >
                {tActions('callNow')}: <span className="font-mono">{site.emergencyPhone}</span>
              </a>
            </div>
          </div>

          {dept.image ? (
            <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto">
              <Image
                src={dept.image}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* Services */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section">
          <span className="eyebrow text-brand">
            {locale === 'hi' ? 'सेवाएँ' : 'Services'}
          </span>
          <h2 className="font-display text-ink mt-3 text-3xl">
            {locale === 'hi' ? 'हम क्या प्रदान करते हैं' : 'What we offer'}
          </h2>
          <ol className="mt-10 grid gap-x-12 gap-y-1 sm:grid-cols-2">
            {pick(dept.services, locale).map((s, i) => (
              <li
                key={s}
                className="border-rule rule-bottom flex items-baseline gap-4 py-4 text-base"
              >
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-ink">{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Doctors */}
      {doctorsHere.length > 0 ? (
        <section className="rule-bottom bg-surface">
          <div className="container-wide py-section">
            <header className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow text-brand">{t('doctors')}</span>
                <h2 className="font-display text-ink mt-3 text-3xl">
                  {locale === 'hi' ? 'इस विभाग के चिकित्सक' : 'Physicians in this department'}
                </h2>
              </div>
              <Link
                href="/patients/doctors"
                className="text-ink hover:text-brand text-sm font-medium tracking-wide"
              >
                {tActions('viewAll')} →
              </Link>
            </header>

            <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {doctorsHere.map((d) => (
                <li key={d.slug} className="flex flex-col">
                  <h3 className="font-display text-ink text-xl">
                    <Link
                      href={`/patients/doctors/${d.slug}`}
                      className="hover:text-brand transition-colors"
                    >
                      {d.name}
                    </Link>
                  </h3>
                  <p className="text-ink-mute mt-1 text-sm">{d.specialty}</p>
                  <p className="text-ink-soft mt-1 font-mono text-[10px] uppercase tracking-wider">
                    {d.qualifications}
                  </p>
                  <p className="text-ink-soft mt-3 text-sm">
                    <span className="opacity-70">OPD:</span> {d.opdDays ?? ''}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const dept = getDepartmentBySlug(slug);
  if (!dept) return {};
  return {
    title: pick(dept.name, locale),
    description: pick(dept.summary, locale),
    alternates: {
      canonical: `/${locale}/patients/departments/${dept.slug[locale]}`,
      languages: hreflangAlternates({
        en: `/en/patients/departments/${dept.slug.en}`,
        hi: `/hi/patients/departments/${dept.slug.hi}`,
      }),
    },
  };
}
