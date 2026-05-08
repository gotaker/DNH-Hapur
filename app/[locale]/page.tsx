import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { site } from '@/lib/site';
import type { Locale } from '@/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const tActions = await getTranslations('actions');

  return (
    <>
      {/* Hero — split structure, statement on left, hero photo on right.
          Phase 2 polish replaces the photographic placeholder with real
          institutional imagery; the typographic shape stays. */}
      <section className="rule-bottom bg-surface">
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
              <Link
                href="/contact"
                className="bg-brand text-surface hover:bg-brand-deep inline-flex items-center px-6 py-3 text-sm font-medium tracking-wide transition-colors"
              >
                {t('heroPrimaryCta')}
              </Link>
              <Link
                href="/patients/departments"
                className="text-ink hover:text-brand border-rule-strong inline-flex items-center border-b px-1 py-3 text-sm font-medium tracking-wide transition-colors"
              >
                {t('heroSecondaryCta')} →
              </Link>
            </div>
          </div>

          <div
            className="bg-surface-deep aspect-[4/5] w-full bg-cover bg-center lg:aspect-auto"
            style={{
              backgroundImage:
                'url(https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80)',
            }}
            role="img"
            aria-label={
              locale === 'hi'
                ? 'देव नंदिनी अस्पताल के मुख्य द्वार का दृश्य।'
                : 'View of the main entrance of Dev Nandini Hospital.'
            }
          />
        </div>
      </section>

      {/* Trust strip — accreditations. Phase 2 fills with real logos. */}
      <section className="rule-bottom bg-surface-mute">
        <div className="container-wide py-section-tight">
          <span className="eyebrow text-ink-mute">{t('trustEyebrow')}</span>
          <ul className="text-ink-mute mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3 md:grid-cols-5">
            <li>NABH</li>
            <li>NABL</li>
            <li>NMC</li>
            <li>FOGSI</li>
            <li>ESIC / Ayushman Bharat</li>
          </ul>
        </div>
      </section>

      {/* Departments — typographic index, no icon-cards. */}
      <section className="rule-bottom bg-surface">
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

          <ul className="mt-12 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
            {[
              'Cardiology',
              'Neurosurgery',
              'IVF and Reproductive Medicine',
              'NICU',
              'Joint Replacement',
              'Gastroenterology',
              'Obstetrics and Gynaecology',
              'General and Laparoscopic Surgery',
              'Orthopaedics',
              'Ophthalmology',
              'Dermatology',
              'Pathology and Blood Bank',
            ].map((name, i) => (
              <li key={name} className="border-rule rule-bottom group flex items-baseline gap-4 py-4">
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Link
                  href="/patients/departments"
                  className="text-ink group-hover:text-brand text-base transition-colors"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Emergency band — committed brand color, single message. */}
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
