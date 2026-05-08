import { news } from '@/content/data/news';
import { pick } from '@/content/data/types';
import { absoluteUrl } from '@/lib/seo';
import { isLocale, type Locale } from '@/i18n/routing';
import { site } from '@/lib/site';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ locale: string }> },
) {
  const { locale: localeParam } = await params;
  const locale: Locale = isLocale(localeParam) ? localeParam : 'hi';
  const sorted = [...news].sort((a, b) => (a.date < b.date ? 1 : -1));

  const channelTitle = site.name[locale] + ' — ' + (locale === 'hi' ? 'समाचार' : 'News');
  const channelLink = absoluteUrl(`/${locale}/news`);
  const channelLanguage = locale === 'hi' ? 'hi-IN' : 'en-IN';

  const items = sorted
    .map((n) => {
      const link = absoluteUrl(`/${locale}/news/${n.slug}`);
      const pubDate = new Date(n.date).toUTCString();
      return [
        '    <item>',
        `      <title>${escapeXml(pick(n.title, locale))}</title>`,
        `      <link>${escapeXml(link)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
        `      <pubDate>${pubDate}</pubDate>`,
        `      <description>${escapeXml(pick(n.excerpt, locale))}</description>`,
        `      <category>${escapeXml(pick(n.category, locale))}</category>`,
        '    </item>',
      ].join('\n');
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${escapeXml(channelLink)}</link>
    <description>${escapeXml(locale === 'hi' ? 'देव नंदिनी से समाचार और शिविर।' : 'News and camps from Dev Nandini.')}</description>
    <language>${channelLanguage}</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
