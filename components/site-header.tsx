import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { site } from '@/lib/site';

export function SiteHeader() {
  const t = useTranslations();

  const primary = [
    { href: '/patients', label: t('nav.patients') },
    { href: '/academics', label: t('nav.academics') },
    { href: '/about', label: t('nav.about') },
    { href: '/news', label: t('nav.news') },
    { href: '/contact', label: t('nav.contact') },
  ];

  return (
    <header className="bg-surface border-rule border-b">
      {/* Utility row — emergency-first, locale switcher, contact */}
      <div className="bg-brand-deep text-surface">
        <div className="container-wide flex items-center justify-between gap-4 py-2 text-xs">
          <a
            href={`tel:${site.emergencyPhone}`}
            className="hover:text-accent inline-flex items-center gap-2 font-medium tracking-wide"
          >
            <span aria-hidden className="bg-accent inline-block size-1.5 rounded-full" />
            <span>{t('actions.emergency24x7')}</span>
            <span className="font-mono">{site.emergencyPhone}</span>
          </a>
          <div className="flex items-center gap-5">
            <a href={`mailto:${site.email}`} className="hover:text-accent hidden sm:inline">
              {site.email}
            </a>
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Brand row + nav */}
      <div className="container-wide flex flex-wrap items-end justify-between gap-6 py-5">
        <Link href="/" className="group inline-flex flex-col">
          <span className="eyebrow text-brand">{t('site.shortName')}</span>
          <span
            className="font-display text-ink mt-0.5 text-2xl leading-none"
            aria-label={t('site.name')}
          >
            {t('site.shortName')}
          </span>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-x-7 gap-y-2">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink hover:text-brand text-sm font-medium tracking-wide transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            className="bg-brand text-surface hover:bg-brand-deep ml-2 inline-flex items-center px-4 py-2 text-sm font-medium tracking-wide transition-colors"
          >
            {t('actions.bookAppointment')}
          </Link>
        </nav>
      </div>
    </header>
  );
}
