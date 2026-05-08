import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/routing';

export function SiteFooter() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const year = new Date().getFullYear();

  const groups = [
    {
      heading: t('footer.patientsHeading'),
      links: [
        { href: '/patients/departments', label: t('nav.departments') },
        { href: '/patients/doctors', label: t('nav.doctors') },
        { href: '/patients/centers', label: t('nav.centers') },
        { href: '/patients/emergency', label: t('nav.emergency') },
      ],
    },
    {
      heading: t('footer.academicsHeading'),
      links: [
        { href: '/academics/programs', label: t('nav.programs') },
        { href: '/academics/admissions', label: t('nav.admissions') },
        { href: '/academics/faculty', label: t('nav.faculty') },
        { href: '/academics/research', label: t('nav.research') },
      ],
    },
    {
      heading: t('footer.institutionHeading'),
      links: [
        { href: '/about', label: t('nav.about') },
        { href: '/news', label: t('nav.news') },
        { href: '/contact', label: t('nav.contact') },
      ],
    },
  ];

  return (
    <footer className="bg-brand-deep text-surface mt-section">
      <div className="container-wide py-section grid gap-12 lg:grid-cols-[1.3fr_repeat(3,1fr)]">
        <div>
          <span className="eyebrow text-accent">{t('site.shortName')}</span>
          <p className="font-display mt-2 text-2xl leading-tight">{t('site.name')}</p>
          <address className="not-italic mt-6 space-y-2 text-sm leading-relaxed opacity-80">
            <div>{site.address[locale]}</div>
            <div>
              <span className="opacity-70">{t('footer.phonesLabel')}:</span>{' '}
              <span className="font-mono">{site.phones.join(' · ')}</span>
            </div>
            <div>
              <span className="opacity-70">{t('footer.emailLabel')}:</span>{' '}
              <a href={`mailto:${site.email}`} className="underline-offset-4 hover:underline">
                {site.email}
              </a>
            </div>
          </address>
        </div>

        {groups.map((group) => (
          <div key={group.heading}>
            <span className="eyebrow text-accent">{group.heading}</span>
            <ul className="mt-3 space-y-2 text-sm">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="opacity-80 transition-opacity hover:opacity-100"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-wide flex flex-wrap items-center justify-between gap-3 py-5 text-xs opacity-70">
          <span>{t('footer.copyright', { year })}</span>
          <span>{t('footer.credits')}</span>
        </div>
      </div>
    </footer>
  );
}
