import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

const NOT_FOUND_MARKER = '__test_not_found__';

vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error(NOT_FOUND_MARKER);
  },
}));

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeDetailPage } from '@/lib/page-shells/locale-detail-page';
import { setRequestLocale } from 'next-intl/server';

type Doctor = { name: string; slug: string };

describe('localeDetailPage', () => {
  it('primes the request locale before fetching', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ name: 'Dr. Test', slug: 'x' });

    await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: fetchFn,
      body: () => null,
    });

    expect(setRequestLocale).toHaveBeenCalledWith('en');
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('renders the body with the resolved record', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: async () => ({ name: 'Dr. Test', slug: 'x' }),
      body: (d) => <h1>{d.name}</h1>,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<h1>Dr. Test</h1>');
  });

  it('throws (calls notFound) when fetch returns null', async () => {
    await expect(
      localeDetailPage<Doctor>({
        locale: 'en',
        fetch: async () => null,
        body: () => null,
      }),
    ).rejects.toThrow(NOT_FOUND_MARKER);
  });

  it('emits exactly one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'en',
      fetch: async () => ({ name: 'Dr. Test', slug: 'x' }),
      jsonLd: (d) => ({ '@type': 'Physician', name: d.name }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    const scriptCount = (html.match(/application\/ld\+json/g) ?? []).length;
    expect(scriptCount).toBe(1);
    expect(html).toContain('"@type":"Physician"');
    expect(html).toContain('"name":"Dr. Test"');
  });

  it('emits zero ld+json scripts when jsonLd is omitted', async () => {
    const tree = await localeDetailPage<Doctor>({
      locale: 'hi',
      fetch: async () => ({ name: 'टेस्ट', slug: 'x' }),
      body: () => null,
    });

    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain('application/ld+json');
  });
});
