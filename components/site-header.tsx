import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LocaleSwitcher } from './locale-switcher';
import { MobileNav } from './mobile-nav';
import { Wordmark } from './wordmark';
import { Button } from './ui/button';
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
    <header className="bg-surface border-rule sticky top-0 z-[60] isolate border-b">
      {/* Utility row — emergency-first, locale switcher, contact.
          Sticky header is solid (not glass) to match the institutional register. */}
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
            <Link href="/search" className="hover:text-accent inline">
              {t('actions.search')}
            </Link>
            <LocaleSwitcher />
          </div>
        </div>
      </div>

      {/* Brand row + nav */}
      <div className="container-wide flex flex-wrap items-center justify-between gap-6 py-5">
        <Link href="/" aria-label={t('site.name')} className="group">
          <Wordmark size="md" tone="ink" showFull />
        </Link>

        <nav aria-label="Primary" className="hidden lg:flex flex-wrap items-center gap-x-7 gap-y-2">
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink hover:text-brand text-sm font-medium tracking-wide transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Button asChild size="md" className="ml-2">
            <Link href="/contact">{t('actions.bookAppointment')}</Link>
          </Button>
        </nav>

        <MobileNav primary={primary} appointmentLabel={t('actions.bookAppointment')} />
      </div>
    </header>
  );
}
