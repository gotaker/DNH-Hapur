'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import type { Locale } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const t = useTranslations('actions');
  const pathname = usePathname();

  const next: Locale = locale === 'hi' ? 'en' : 'hi';

  return (
    <Link
      href={pathname}
      locale={next}
      lang={next}
      aria-label={`Switch to ${next === 'hi' ? 'Hindi' : 'English'}`}
      className="text-ink-mute hover:text-brand inline-flex items-center gap-1 text-sm font-medium tracking-wide transition-colors"
    >
      <span aria-hidden>{locale === 'hi' ? 'EN' : 'हि'}</span>
      <span className="sr-only">{t('switchLocale')}</span>
    </Link>
  );
}
