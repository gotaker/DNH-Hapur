import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Wordmark } from './wordmark';
import { site } from '@/lib/site';
import { departments } from '@/content/data/departments';
import type { Locale } from '@/i18n/routing';

/**
 * Site footer — institutional gateway register.
 *
 * Three-band layout: identity + contact channels on the left, four
 * editorial gateways (Patients, Medical College, News, Institution)
 * with descriptions in the middle, and a two-column live index of
 * clinical departments on the right (with a "Center of Excellence"
 * sub-label on flagged departments). Bilingual; every label comes
 * from the message catalog and every department slug resolves through
 * the locale-aware `Link`.
 */
export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();

  const sections = [
    {
      href: '/patients',
      title: t('footer.patientsHeading'),
      desc: t('footer.patientsDesc'),
    },
    {
      href: '/academics',
      title: t('footer.academicsHeading'),
      desc: t('footer.academicsDesc'),
    },
    {
      href: '/news',
      title: t('nav.news'),
      desc: t('footer.newsDesc'),
    },
    {
      href: '/about',
      title: t('footer.institutionHeading'),
      desc: t('footer.institutionDesc'),
    },
  ];

  return (
    <footer className="bg-brand-deep text-surface mt-section">
      <div className="container-wide grid gap-12 pt-16 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
        {/* Identity + contact channels. */}
        <div className="space-y-6 lg:col-span-3">
          <Link href="/" aria-label={t('site.name')} className="inline-block">
            <Wordmark size="md" tone="light" variant="stacked" showFull />
          </Link>

          <p className="text-sm leading-relaxed opacity-70">{t('footer.establishedLine')}</p>

          <address className="text-sm leading-relaxed not-italic opacity-85">
            {site.address[locale]}
          </address>

          <ul className="space-y-2.5">
            <li>
              <Link
                href="/patients/doctors"
                className="hover:text-accent text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
              >
                {t('nav.doctors')} <span aria-hidden>›</span>
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-accent text-xs font-semibold uppercase tracking-[0.14em] transition-colors"
              >
                {t('nav.contact')} <span aria-hidden>›</span>
              </Link>
            </li>
          </ul>

          <div>
            <span className="sr-only">{t('footer.channelsLabel')}</span>
            <ul className="flex items-center gap-2.5 pt-1">
              <li>
                <a
                  href={`https://wa.me/${site.whatsapp}`}
                  aria-label={t('actions.whatsapp')}
                  className="border-surface/25 hover:border-accent hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ChannelIcon name="whatsapp" />
                </a>
              </li>
              <li>
                <a
                  href={`tel:${site.phones[0]}`}
                  aria-label={t('actions.callNow')}
                  className="border-surface/25 hover:border-accent hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                >
                  <ChannelIcon name="phone" />
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.email}`}
                  aria-label={t('footer.emailLabel')}
                  className="border-surface/25 hover:border-accent hover:text-accent inline-flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                >
                  <ChannelIcon name="mail" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Editorial gateway sections. */}
        <div className="space-y-7 lg:col-span-3">
          {sections.map((section) => (
            <div key={section.href}>
              <Link href={section.href} className="hover:text-accent group inline-block">
                <span className="eyebrow text-accent group-hover:text-accent">{section.title}</span>{' '}
                <span aria-hidden className="text-accent text-xs">
                  ›
                </span>
              </Link>
              <p className="mt-2 text-sm leading-relaxed opacity-80">{section.desc}</p>
            </div>
          ))}
        </div>

        {/* Live clinical departments index — two columns on lg, one on md. */}
        <div className="md:col-span-2 lg:col-span-6">
          <Link href="/patients/departments" className="hover:text-accent group inline-block">
            <span className="eyebrow text-accent">{t('footer.departmentsHeading')}</span>{' '}
            <span aria-hidden className="text-accent text-xs">
              ›
            </span>
          </Link>
          <ul className="mt-5 grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
            {departments.map((dept) => (
              <li key={dept.slug.en}>
                <Link
                  href={`/patients/departments/${dept.slug[locale]}`}
                  className="hover:text-accent text-sm leading-snug transition-colors"
                >
                  {dept.name[locale]}
                </Link>
                {dept.isCenter && (
                  <span className="mt-0.5 block pl-3 text-xs leading-snug opacity-65">
                    {t('footer.centerLabel')}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-surface/15 border-t">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-5 text-xs opacity-70">
          <span>{t('footer.copyright', { year })}</span>
          <span>{t('footer.credits')}</span>
        </div>
      </div>
    </footer>
  );
}

/**
 * Channel chip icons — single-stroke, uniform 16px viewBox, no fills.
 * Inline SVG (no icon dep) keeps the chrome bundle tight and lets the
 * marks pick up `currentColor` for the hover state.
 */
function ChannelIcon({ name }: { name: 'whatsapp' | 'phone' | 'mail' }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  if (name === 'whatsapp') {
    return (
      <svg {...common}>
        <path d="M3 21l1.65-4.5A8.5 8.5 0 1 1 7.5 19.4L3 21z" />
        <path d="M9 9.5c0-.55.45-1 1-1h.7c.27 0 .5.18.58.44l.45 1.5a.6.6 0 0 1-.16.62l-.7.7a8 8 0 0 0 3.4 3.4l.7-.7a.6.6 0 0 1 .62-.16l1.5.45c.26.08.44.31.44.58V16c0 .55-.45 1-1 1A8 8 0 0 1 9 9.5z" />
      </svg>
    );
  }

  if (name === 'phone') {
    return (
      <svg {...common}>
        <path d="M5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.3 5.3L14 12.5l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3.5 6.5l8.5 6 8.5-6" />
    </svg>
  );
}
