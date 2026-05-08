import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { PageHeader } from '@/components/page-header';
import { news } from '@/content/data/news';
import { pick } from '@/content/data/types';
import type { Locale } from '@/i18n/routing';

export default async function NewsPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const tNav = await getTranslations('nav');

  const sorted = [...news].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <>
      <PageHeader
        eyebrow={tNav('news')}
        title={tNav('news')}
        lede={
          locale === 'hi'
            ? 'घोषणाएँ, स्वास्थ्य शिविर, मान्यता समाचार और शिक्षण कार्यक्रम।'
            : 'Announcements, health camps, accreditation news, and teaching events.'
        }
      />

      <section className="bg-surface">
        <div className="container-wide py-section">
          <ol className="grid gap-x-12 gap-y-0">
            {sorted.map((n) => (
              <li
                key={n.slug}
                className="border-rule rule-bottom group grid gap-3 py-10 md:grid-cols-[10rem_1fr] md:gap-12"
              >
                <div>
                  <span className="eyebrow text-brand">{pick(n.category, locale)}</span>
                  <time
                    dateTime={n.date}
                    className="text-ink-soft mt-2 block font-mono text-xs tabular-nums"
                  >
                    {new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    }).format(new Date(n.date))}
                  </time>
                </div>
                <div>
                  <h2 className="font-display text-ink text-3xl leading-snug">
                    <Link
                      href={`/news/${n.slug}`}
                      className="group-hover:text-brand transition-colors"
                    >
                      {pick(n.title, locale)}
                    </Link>
                  </h2>
                  <p className="text-ink-mute mt-3 max-w-prose text-base leading-relaxed">
                    {pick(n.excerpt, locale)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
