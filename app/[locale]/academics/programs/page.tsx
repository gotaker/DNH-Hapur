import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import { programs } from '@/content/data/programs';
import { pick } from '@/content/data/types';
import { localizedHref } from '@/lib/href';
import type { Locale } from '@/i18n/routing';

export default async function ProgramsListPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');
  const lvlLabel: Record<(typeof programs)[number]['level'], { en: string; hi: string }> = {
    undergraduate: { en: 'Undergraduate', hi: 'स्नातक' },
    postgraduate: { en: 'Postgraduate', hi: 'स्नातकोत्तर' },
    fellowship: { en: 'Fellowship', hi: 'फ़ेलोशिप' },
    paramedical: { en: 'Paramedical / Nursing', hi: 'पैरामेडिकल / नर्सिंग' },
    training: { en: 'Training', hi: 'प्रशिक्षण' },
  };

  return (
    <>
      <PageHeader
        eyebrow={t('academics')}
        title={t('programs')}
        lede={
          locale === 'hi'
            ? 'एमबीबीएस से लेकर FOGSI-मान्यता प्राप्त बाँझपन फ़ेलोशिप तक। नीचे की सूची से कोई भी पाठ्यक्रम चुनें।'
            : 'From MBBS to a FOGSI-accredited infertility fellowship. Choose any program below to see eligibility, intake, and how to apply.'
        }
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          <ol className="grid gap-x-12 gap-y-0">
            {programs.map((p, i) => (
              <li
                key={p.slug.en}
                className="border-rule rule-bottom group grid gap-4 py-10 md:grid-cols-[3rem_1.4fr_1fr_auto] md:items-baseline md:gap-8"
              >
                <span className="text-ink-soft font-mono text-xs tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h2 className="font-display text-ink text-3xl leading-tight">
                    <Link
                      href={localizedHref('/academics/programs', p.slug, locale)}
                      className="group-hover:text-brand transition-colors"
                    >
                      {pick(p.title, locale)}
                    </Link>
                  </h2>
                  <p className="text-ink-mute mt-2 max-w-xl text-sm leading-relaxed">
                    {pick(p.summary, locale)}
                  </p>
                </div>
                <dl className="text-ink space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">
                      {locale === 'hi' ? 'अवधि' : 'Duration'}
                    </dt>
                    <dd>{pick(p.duration, locale)}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">{locale === 'hi' ? 'सीटें' : 'Seats'}</dt>
                    <dd className="tabular-nums">{p.intake}</dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-soft">
                      {locale === 'hi' ? 'मान्यता' : 'Accreditation'}
                    </dt>
                    <dd className="font-mono">{p.accreditation}</dd>
                  </div>
                </dl>
                <span className="text-brand text-xs font-medium tracking-wide opacity-60 group-hover:opacity-100 transition-opacity">
                  {pick(lvlLabel[p.level], locale)} →
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
