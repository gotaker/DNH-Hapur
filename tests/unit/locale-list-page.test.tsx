import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeListPage } from '@/lib/page-shells/locale-list-page';
import { setRequestLocale } from 'next-intl/server';

type Doctor = { name: string; slug: string };

describe('localeListPage', () => {
  it('primes the request locale before fetching', async () => {
    const listFn = vi.fn().mockResolvedValue([]);
    await localeListPage<Doctor>({
      locale: 'hi',
      list: listFn,
      body: () => null,
    });
    expect(setRequestLocale).toHaveBeenCalledWith('hi');
    expect(listFn).toHaveBeenCalledTimes(1);
  });

  it('renders the body with the resolved list', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [
        { name: 'Dr. A', slug: 'a' },
        { name: 'Dr. B', slug: 'b' },
      ],
      body: (records) => (
        <ul>
          {records.map((d) => (
            <li key={d.slug}>{d.name}</li>
          ))}
        </ul>
      ),
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<li>Dr. A</li>');
    expect(html).toContain('<li>Dr. B</li>');
  });

  it('renders the body with an empty array when list returns empty', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [],
      body: (records) => <p>{records.length === 0 ? 'No results' : 'Some'}</p>,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<p>No results</p>');
  });

  it('emits one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeListPage<Doctor>({
      locale: 'en',
      list: async () => [{ name: 'A', slug: 'a' }],
      jsonLd: (records) => ({
        '@type': 'ItemList',
        numberOfItems: records.length,
      }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    expect((html.match(/application\/ld\+json/g) ?? []).length).toBe(1);
    expect(html).toContain('"@type":"ItemList"');
    expect(html).toContain('"numberOfItems":1');
  });
});
