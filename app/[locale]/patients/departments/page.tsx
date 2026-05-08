import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import { departments } from '@/content/data/departments';
import { pick } from '@/content/data/types';
import { localizedHref } from '@/lib/href';
import type { Locale } from '@/i18n/routing';

export default async function DepartmentsListPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('nav');

  return (
    <>
      <PageHeader
        eyebrow={t('patients')}
        title={t('departments')}
        lede={
          locale === 'hi'
            ? 'तीस से अधिक नैदानिक विभाग, एक संस्थान। नीचे की सूची से अपना विभाग चुनें या मुख्य OPD पर सीधे संपर्क करें।'
            : 'More than thirty clinical departments under one institution. Pick yours below, or call the main OPD directly.'
        }
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          <ol className="grid gap-x-12 gap-y-0 sm:grid-cols-2">
            {departments.map((d, i) => (
              <li
                key={d.slug.en}
                className="border-rule rule-bottom group flex flex-col gap-2 py-8 md:flex-row md:items-baseline md:gap-8"
              >
                <span className="text-ink-soft font-mono text-xs tabular-nums md:w-12">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1">
                  <h2 className="font-display text-ink text-2xl leading-snug">
                    <Link
                      href={localizedHref('/patients/departments', d.slug, locale)}
                      className="group-hover:text-brand transition-colors"
                    >
                      {pick(d.name, locale)}
                    </Link>
                  </h2>
                  <p className="text-ink-mute mt-2 max-w-2xl text-sm leading-relaxed">
                    {pick(d.summary, locale)}
                  </p>
                </div>
                <Link
                  href={localizedHref('/patients/departments', d.slug, locale)}
                  className="text-brand text-xs font-medium tracking-wide opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden
                >
                  →
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
