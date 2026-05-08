import { notFound } from 'next/navigation';
import Image from 'next/image';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { doctors, getDoctor } from '@/content/data/doctors';
import { departments } from '@/content/data/departments';
import { pick } from '@/content/data/types';
import { hreflangAlternates, physicianJsonLd } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return doctors.flatMap((d) => routing.locales.map((locale) => ({ locale, slug: d.slug })));
}

export default async function DoctorProfilePage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const d = getDoctor(slug);
  if (!d) notFound();

  const tNav = await getTranslations('nav');
  const tActions = await getTranslations('actions');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  const doctorDepartments = departments.filter((dep) => d.departments.includes(dep.slug.en));

  return (
    <>
      <JsonLd
        data={physicianJsonLd({
          locale,
          slug: d.slug,
          name: pick(d.name, locale),
          specialty: pick(d.specialty, locale),
          qualifications: d.qualifications,
          bio: pick(d.bio, locale),
          image: d.image,
        })}
      />
      <section className="rule-bottom bg-surface">
        <div className="container-wide grid gap-12 py-section lg:grid-cols-[1fr_1.4fr]">
          <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
            {d.image ? (
              <Image
                src={d.image}
                alt=""
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
              {pick(d.name, locale)}
            </h1>
            <p className="text-ink-mute mt-3 text-lg">{pick(d.specialty, locale)}</p>
            <p className="text-ink-soft mt-1 font-mono text-xs uppercase tracking-wider">
              {d.qualifications}
            </p>

            <dl className="border-rule mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-6 sm:grid-cols-3">
              <div>
                <dt className="eyebrow text-ink-mute">OPD</dt>
                <dd className="text-ink mt-1 text-sm">{pick(d.opdDays, locale)}</dd>
              </div>
              <div>
                <dt className="eyebrow text-ink-mute">{t('Languages', 'भाषाएँ')}</dt>
                <dd className="text-ink mt-1 text-sm">{pick(d.languages, locale).join(', ')}</dd>
              </div>
              {d.registration ? (
                <div>
                  <dt className="eyebrow text-ink-mute">{t('Registration', 'पंजीकरण')}</dt>
                  <dd className="text-ink mt-1 font-mono text-sm">{d.registration}</dd>
                </div>
              ) : null}
            </dl>

            <p className="text-ink mt-10 max-w-prose text-base leading-relaxed">
              {pick(d.bio, locale)}
            </p>

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
                <li key={dep.slug.en}>
                  <Link
                    href={`/patients/departments/${dep.slug[locale]}`}
                    className="font-display text-ink hover:text-brand text-2xl transition-colors"
                  >
                    {pick(dep.name, locale)}
                  </Link>
                  <p className="text-ink-mute mt-2 text-sm leading-relaxed">
                    {pick(dep.summary, locale)}
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
  const d = getDoctor(slug);
  if (!d) return {};
  return {
    title: pick(d.name, locale),
    description: pick(d.specialty, locale) + '. ' + pick(d.bio, locale).slice(0, 160),
    alternates: {
      canonical: `/${locale}/patients/doctors/${d.slug}`,
      languages: hreflangAlternates({
        en: `/en/patients/doctors/${d.slug}`,
        hi: `/hi/patients/doctors/${d.slug}`,
      }),
    },
  };
}
