import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
}));

import { localeStaticPage } from '@/lib/page-shells/locale-static-page';
import { setRequestLocale } from 'next-intl/server';

describe('localeStaticPage', () => {
  it('primes the request locale', async () => {
    await localeStaticPage({
      locale: 'en',
      body: () => null,
    });
    expect(setRequestLocale).toHaveBeenCalledWith('en');
  });

  it('renders the body', async () => {
    const tree = await localeStaticPage({
      locale: 'en',
      body: () => <main>About page body</main>,
    });
    const html = renderToStaticMarkup(tree);
    expect(html).toContain('<main>About page body</main>');
  });

  it('emits one application/ld+json script when jsonLd is provided', async () => {
    const tree = await localeStaticPage({
      locale: 'hi',
      jsonLd: { '@type': 'WebPage', name: 'संपर्क' },
      body: () => null,
    });
    const html = renderToStaticMarkup(tree);
    expect((html.match(/application\/ld\+json/g) ?? []).length).toBe(1);
    expect(html).toContain('"@type":"WebPage"');
  });

  it('emits no ld+json when jsonLd is omitted', async () => {
    const tree = await localeStaticPage({
      locale: 'en',
      body: () => null,
    });
    const html = renderToStaticMarkup(tree);
    expect(html).not.toContain('application/ld+json');
  });
});
