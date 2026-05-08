import { setRequestLocale, getTranslations } from 'next-intl/server';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/routing';

export default async function ContactPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const tFooter = await getTranslations('footer');

  return (
    <section className="container-content py-section">
      <span className="eyebrow text-brand">{t('contact')}</span>
      <h1 className="font-display mt-3 text-4xl">{t('contact')}</h1>

      <dl className="mt-10 grid gap-x-10 gap-y-6 text-base sm:grid-cols-2">
        <div>
          <dt className="eyebrow text-ink-mute">{tFooter('address').split(':')[0] ?? 'Address'}</dt>
          <dd className="text-ink mt-1">{site.address[locale]}</dd>
        </div>
        <div>
          <dt className="eyebrow text-ink-mute">{tFooter('phonesLabel')}</dt>
          <dd className="text-ink mt-1 font-mono">{site.phones.join(' · ')}</dd>
        </div>
        <div>
          <dt className="eyebrow text-ink-mute">{tFooter('emailLabel')}</dt>
          <dd className="text-ink mt-1">
            <a href={`mailto:${site.email}`} className="hover:text-brand underline-offset-4 hover:underline">
              {site.email}
            </a>
          </dd>
        </div>
      </dl>

      <p className="text-ink-mute mt-12 max-w-prose">
        {locale === 'hi'
          ? 'पूर्ण संपर्क फ़ॉर्म चरण 7 में जोड़ा जाएगा।'
          : 'Full contact form is wired in phase 7.'}
      </p>
    </section>
  );
}
