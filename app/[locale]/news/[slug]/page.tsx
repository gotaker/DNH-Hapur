import { notFound } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { JsonLd } from '@/components/json-ld';
import { news, getNewsItem } from '@/content/data/news';
import { pick } from '@/content/data/types';
import { hreflangAlternates, newsArticleJsonLd } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';

export function generateStaticParams() {
  return news.flatMap((n) => routing.locales.map((locale) => ({ locale, slug: n.slug })));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const item = getNewsItem(slug);
  if (!item) notFound();

  const tNav = await getTranslations('nav');

  return (
    <article>
      <JsonLd
        data={newsArticleJsonLd({
          locale,
          slug: item.slug,
          title: pick(item.title, locale),
          excerpt: pick(item.excerpt, locale),
          date: item.date,
        })}
      />
      <section className="rule-bottom bg-surface">
        <div className="container-narrow pt-section pb-section-tight">
          <Link
            href="/news"
            className="text-ink-mute hover:text-brand text-xs font-medium tracking-wide"
          >
            ← {tNav('news')}
          </Link>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4">
            <span className="eyebrow text-brand">{pick(item.category, locale)}</span>
            <time
              dateTime={item.date}
              className="text-ink-soft font-mono text-xs tabular-nums"
            >
              {new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              }).format(new Date(item.date))}
            </time>
          </div>
          <h1 className="font-display text-ink mt-6 text-5xl leading-[1.05] tracking-tight">
            {pick(item.title, locale)}
          </h1>
          <p className="text-ink-mute mt-6 text-xl leading-relaxed">{pick(item.excerpt, locale)}</p>
        </div>
      </section>

      <section className="bg-surface">
        <div className="container-narrow py-section">
          <div className="text-ink space-y-6 text-base leading-relaxed">
            {pick(item.body, locale)
              .split('\n\n')
              .map((p, i) => (
                <p key={i}>{p}</p>
              ))}
          </div>
        </div>
      </section>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = getNewsItem(slug);
  if (!item) return {};
  return {
    title: pick(item.title, locale),
    description: pick(item.excerpt, locale),
    alternates: {
      canonical: `/${locale}/news/${item.slug}`,
      languages: hreflangAlternates({
        en: `/en/news/${item.slug}`,
        hi: `/hi/news/${item.slug}`,
      }),
    },
  };
}
