import { setRequestLocale, getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/json-ld';
import { departments } from '@/content/data/departments';
import { news } from '@/content/data/news';
import { pick } from '@/content/data/types';
import { getReader } from '@/lib/content';
import { hospitalJsonLd, hreflangAlternates } from '@/lib/seo';
import type { Locale } from '@/i18n/routing';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return {
    alternates: {
      canonical: `/${locale}`,
      languages: hreflangAlternates({ en: '/en', hi: '/hi' }),
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tActions = await getTranslations('actions');

  const reader = await getReader();
  const centers = departments.filter((d) => d.isCenter);
  const otherDepartments = departments;
  const featuredNews = news.slice(0, 3);
  const featuredDoctors = (await reader.listDoctors(locale)).slice(0, 8);

  return (
    <>
      <JsonLd data={hospitalJsonLd(locale)} />
      {/* HERO ------------------------------------------------------------ */}
      <section className="rule-bottom bg-surface relative">
        <div className="container-wide grid gap-10 py-section lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div className="flex flex-col justify-center">
            <span className="eyebrow text-brand">{t('heroEyebrow')}</span>
            <h1
              className="font-display text-ink mt-4 text-5xl leading-[1.05] tracking-tight"
              style={{ textWrap: 'balance' }}
            >
              {t('heroHeadline')}
            </h1>
            <p className="text-ink-mute mt-6 max-w-prose text-lg leading-relaxed">
              {t('heroBody')}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild size="lg">
                <Link href="/contact">{t('heroPrimaryCta')}</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/patients/departments">{t('heroSecondaryCta')} →</Link>
              </Button>
            </div>

            {/* Stat strip — institutional credibility, no rounded chrome. */}
            <dl className="mt-14 grid grid-cols-3 gap-x-6 gap-y-1 border-t border-rule pt-6">
              {[
                {
                  k: locale === 'hi' ? 'स्थापित' : 'Founded',
                  v: String(site.established),
                },
                {
                  k: locale === 'hi' ? 'विशेषज्ञताएँ' : 'Specialties',
                  v: '30+',
                },
                {
                  k: locale === 'hi' ? 'ICU + NICU' : 'ICU + NICU',
                  v: '24×7',
                },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="eyebrow text-ink-soft">{s.k}</dt>
                  <dd className="font-display text-ink mt-1 text-3xl tabular-nums">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto">
            <Image
              src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1600&q=80"
              alt={
                locale === 'hi'
                  ? 'देव नंदिनी अस्पताल की मुख्य लॉबी का दृश्य।'
                  : 'View of the main lobby at Dev Nandini Hospital.'
              }
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* TRUST STRIP ----------------------------------------------------- */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section-tight">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <span className="eyebrow text-ink-mute">{t('trustEyebrow')}</span>
            <span className="text-ink-soft text-xs">
              {locale === 'hi'
                ? 'मान्यता और संबद्धताएँ'
                : 'Independently audited and government-affiliated'}
            </span>
          </div>
          <ul className="text-ink mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm font-medium tracking-wide sm:grid-cols-3 md:grid-cols-5">
            <li>NABH</li>
            <li>NABL</li>
            <li>NMC</li>
            <li>FOGSI</li>
            <li>ESIC / Ayushman Bharat</li>
          </ul>
        </div>
      </section>

      {/* CENTERS OF EXCELLENCE ------------------------------------------- */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section">
          <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <span className="eyebrow text-brand">{t('centersEyebrow')}</span>
              <h2 className="font-display text-ink mt-3 text-4xl leading-tight">
                {t('centersHeadline')}
              </h2>
            </div>
            <Button asChild variant="ghost" size="md">
              <Link href="/patients/departments">
                {tActions('viewAll')} →
              </Link>
            </Button>
          </header>

          <ol className="mt-12 grid gap-px bg-rule sm:grid-cols-2 lg:grid-cols-5">
            {centers.map((c, i) => (
              <li key={c.slug.en} className="bg-surface flex flex-col p-6">
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  N°{String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display text-ink mt-3 text-xl leading-snug">
                  {pick(c.name, locale)}
                </h3>
                <p className="text-ink-mute mt-3 text-sm leading-relaxed">
                  {pick(c.summary, locale)}
                </p>
                <Link
                  href="/patients/departments"
                  className="text-brand hover:text-brand-deep mt-auto pt-6 text-xs font-medium tracking-wide transition-colors"
                >
                  {locale === 'hi' ? 'अधिक जानें' : 'Learn more'} →
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* DEPARTMENTS INDEX ----------------------------------------------- */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-brand">{t('departmentsEyebrow')}</span>
              <h2 className="font-display text-ink mt-3 max-w-2xl text-4xl leading-tight">
                {t('departmentsHeadline')}
              </h2>
            </div>
            <Link
              href="/patients/departments"
              className="text-ink hover:text-brand text-sm font-medium tracking-wide"
            >
              {tActions('viewAll')} →
            </Link>
          </header>

          <ul className="mt-12 grid gap-x-10 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {otherDepartments.map((d, i) => (
              <li
                key={d.slug.en}
                className="border-rule rule-bottom group flex items-baseline gap-4 py-4"
              >
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Link
                  href={`/patients/departments/${d.slug.en}`}
                  className="text-ink group-hover:text-brand text-base transition-colors"
                >
                  {pick(d.name, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* DOCTORS --------------------------------------------------------- */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section">
          <header className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <span className="eyebrow text-brand">{t('doctorsEyebrow')}</span>
              <h2 className="font-display text-ink mt-3 max-w-2xl text-4xl leading-tight">
                {t('doctorsHeadline')}
              </h2>
            </div>
            <Button asChild variant="ghost" size="md">
              <Link href="/patients/doctors">{tActions('viewAll')} →</Link>
            </Button>
          </header>

          <ul className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {featuredDoctors.map((d) => (
              <li key={d.slug} className="flex flex-col">
                {d.image ? (
                  <div className="bg-surface-deep relative aspect-[4/5] w-full overflow-hidden">
                    <Image
                      src={d.image.url}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover grayscale transition-[filter] hover:grayscale-0"
                    />
                  </div>
                ) : (
                  <div className="aspect-[4/5] w-full bg-surface-deep" aria-hidden />
                )}
                <h3 className="font-display text-ink mt-4 text-lg leading-snug">
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
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* MEDICAL COLLEGE TEASER ------------------------------------------ */}
      <section className="rule-bottom bg-brand-deep text-surface">
        <div className="container-wide py-section grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <span className="eyebrow text-accent">{t('academicsEyebrow')}</span>
            <h2 className="font-display mt-4 text-5xl leading-[1.05]">
              {t('academicsHeadline')}
            </h2>
            <p className="mt-6 max-w-prose text-lg leading-relaxed opacity-85">
              {locale === 'hi'
                ? 'एमबीबीएस से लेकर FOGSI-मान्यता प्राप्त बाँझपन फ़ेलोशिप तक — हमारा चिकित्सा महाविद्यालय एक तृतीयक देखभाल अस्पताल के साथ-साथ चलता है, जिससे छात्रों को पहले दिन से ही सच्चे क्लीनिकल प्रदर्शन का अवसर मिलता है।'
                : 'From MBBS to a FOGSI-accredited infertility fellowship, our medical college runs alongside a tertiary-care hospital, putting students on the wards from day one.'}
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="accent">
                <Link href="/academics/admissions">
                  {locale === 'hi' ? 'प्रवेश 2026' : 'Admissions 2026'}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="text-surface hover:text-accent"
              >
                <Link href="/academics/programs">
                  {locale === 'hi' ? 'पाठ्यक्रम देखें' : 'See programs'} →
                </Link>
              </Button>
            </div>
          </div>

          <ul className="grid grid-cols-1 gap-px self-end bg-white/15 sm:grid-cols-2">
            {[
              {
                k: locale === 'hi' ? 'एमबीबीएस सीटें' : 'MBBS seats',
                v: '100',
              },
              {
                k: locale === 'hi' ? 'पीजी विशेषज्ञताएँ' : 'PG specialties',
                v: '8',
              },
              {
                k: locale === 'hi' ? 'फ़ेलोशिप' : 'Fellowships',
                v: 'FOGSI',
              },
              {
                k: locale === 'hi' ? 'जीएनएम सीटें' : 'GNM seats',
                v: '60',
              },
            ].map((s) => (
              <li key={s.k} className="bg-brand-deep p-6">
                <span className="font-mono text-xs uppercase tracking-wider opacity-70">
                  {s.k}
                </span>
                <p className="font-display mt-2 text-4xl tabular-nums">{s.v}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* NEWS / CAMPS ---------------------------------------------------- */}
      <section className="rule-bottom bg-surface">
        <div className="container-wide py-section">
          <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow text-brand">{t('newsEyebrow')}</span>
              <h2 className="font-display text-ink mt-3 text-4xl leading-tight">
                {locale === 'hi' ? 'समाचार और शिविर' : 'News and camps'}
              </h2>
            </div>
            <Button asChild variant="ghost" size="md">
              <Link href="/news">{tActions('viewAll')} →</Link>
            </Button>
          </header>

          <ul className="mt-12 grid gap-px bg-rule lg:grid-cols-3">
            {featuredNews.map((n) => (
              <li key={n.slug} className="bg-surface flex flex-col p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="eyebrow text-brand">{pick(n.category, locale)}</span>
                  <time
                    dateTime={n.date}
                    className="text-ink-soft font-mono text-xs tabular-nums"
                  >
                    {new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(n.date))}
                  </time>
                </div>
                <h3 className="font-display text-ink mt-4 text-xl leading-snug">
                  <Link
                    href={`/news/${n.slug}`}
                    className="hover:text-brand transition-colors"
                  >
                    {pick(n.title, locale)}
                  </Link>
                </h3>
                <p className="text-ink-mute mt-3 text-sm leading-relaxed">
                  {pick(n.excerpt, locale)}
                </p>
                <Link
                  href={`/news/${n.slug}`}
                  className="text-brand hover:text-brand-deep mt-auto pt-6 text-xs font-medium tracking-wide transition-colors"
                >
                  {tActions('readMore')} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* EMERGENCY BAND -------------------------------------------------- */}
      <section className="bg-brand text-surface">
        <div className="container-wide py-section grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <span className="eyebrow text-accent">{tActions('emergency24x7')}</span>
            <h2 className="font-display mt-3 text-4xl leading-tight">{t('emergencyHeadline')}</h2>
            <p className="mt-4 max-w-xl opacity-85">{t('emergencyBody')}</p>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            <a
              href={`tel:${site.emergencyPhone}`}
              className="bg-surface text-brand-deep hover:bg-accent inline-flex items-center px-6 py-3 font-mono text-lg tracking-wide transition-colors"
            >
              {site.emergencyPhone}
            </a>
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm underline-offset-4 hover:underline"
            >
              {tActions('whatsapp')} →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
