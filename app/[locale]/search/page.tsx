import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import { Input } from '@/components/ui/input';
import { searchAll, type SearchHit } from '@/lib/search';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  const { q = '' } = await searchParams;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');
  const t = (en: string, hi: string) => (locale === 'hi' ? hi : en);

  const hits = q ? searchAll(q, locale) : [];
  const grouped = groupByKind(hits);

  return (
    <>
      <PageHeader
        eyebrow={tNav('skipToContent') /* reused as utility eyebrow */}
        title={t('Search', 'खोज')}
        lede={t(
          'Search across departments, physicians, and programs in either language.',
          'विभागों, चिकित्सकों और पाठ्यक्रमों में किसी भी भाषा में खोज करें।',
        )}
        meta={
          <form
            method="get"
            action={`/${locale}/search`}
            className="border-rule rule-bottom flex max-w-xl items-center gap-3 border-t pt-4"
          >
            <Input
              name="q"
              defaultValue={q}
              autoFocus
              type="search"
              placeholder={t('Search…', 'खोजें…')}
              aria-label={t('Search', 'खोज')}
            />
            <button
              type="submit"
              className="text-brand text-xs font-medium tracking-wide whitespace-nowrap"
            >
              {t('Search', 'खोज')} →
            </button>
          </form>
        }
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          {!q ? (
            <p className="text-ink-mute text-base">
              {t(
                'Type a doctor name, specialty, or program above.',
                'ऊपर एक चिकित्सक का नाम, विशेषज्ञता या पाठ्यक्रम लिखें।',
              )}
            </p>
          ) : hits.length === 0 ? (
            <p className="text-ink-mute text-base">
              {t('No matches.', 'कोई परिणाम नहीं।')}
            </p>
          ) : (
            <div className="grid gap-12 lg:grid-cols-3">
              <Group
                heading={t('Physicians', 'चिकित्सक')}
                hits={grouped.doctor}
                emptyText={t('No matches.', 'कोई परिणाम नहीं।')}
              />
              <Group
                heading={t('Departments', 'विभाग')}
                hits={grouped.department}
                emptyText={t('No matches.', 'कोई परिणाम नहीं।')}
              />
              <Group
                heading={t('Programs', 'पाठ्यक्रम')}
                hits={grouped.program}
                emptyText={t('No matches.', 'कोई परिणाम नहीं।')}
              />
            </div>
          )}
        </div>
      </section>
    </>
  );
}

function groupByKind(hits: SearchHit[]) {
  return {
    doctor: hits.filter((h) => h.kind === 'doctor'),
    department: hits.filter((h) => h.kind === 'department'),
    program: hits.filter((h) => h.kind === 'program'),
  };
}

function Group({
  heading,
  hits,
  emptyText,
}: {
  heading: string;
  hits: SearchHit[];
  emptyText: string;
}) {
  return (
    <div>
      <span className="eyebrow text-brand">{heading}</span>
      {hits.length === 0 ? (
        <p className="text-ink-soft mt-6 text-sm">{emptyText}</p>
      ) : (
        <ol className="mt-6 space-y-1">
          {hits.map((h) => (
            <li key={`${h.kind}-${h.slug}`} className="border-rule rule-bottom py-4">
              <Link
                href={h.href.replace(/^\/(en|hi)/, '')}
                className="font-display text-ink hover:text-brand text-xl transition-colors"
              >
                {h.title}
              </Link>
              <p className="text-ink-mute mt-1 text-sm leading-relaxed">{h.subtitle}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
