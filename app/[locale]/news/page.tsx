import { setRequestLocale, getTranslations } from 'next-intl/server';
import type { Locale } from '@/i18n/routing';

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');

  return (
    <section className="container-content py-section">
      <span className="eyebrow text-brand">{t('news')}</span>
      <h1 className="font-display mt-3 text-4xl">{t('news')}</h1>
      <p className="text-ink-mute mt-4 max-w-prose">
        {locale === 'hi'
          ? 'इस अनुभाग का विस्तार चरण 4 में किया जाएगा।'
          : 'This section is built out in phase 4.'}
      </p>
    </section>
  );
}
