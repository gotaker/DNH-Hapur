import { expect, test } from '@playwright/test';

const localePages = ['/hi', '/en'] as const;

test.describe('seo and header adversarial audit', () => {
  test('locale pages expose canonical, hreflang alternates, and parseable JSON-LD', async ({
    page,
  }) => {
    for (const path of localePages) {
      await page.goto(path);

      await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hrefLang="hi-IN"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hrefLang="en-IN"]')).toHaveCount(1);
      await expect(page.locator('link[rel="alternate"][hrefLang="x-default"]')).toHaveCount(1);

      const jsonLdScripts = page.locator('script[type="application/ld+json"]');
      await expect(jsonLdScripts).toHaveCount(1);

      const raw = (await jsonLdScripts.first().textContent()) ?? '';
      expect(raw.includes('<')).toBe(false);
      expect(() => JSON.parse(raw)).not.toThrow();
    }
  });

  test('global security headers are present on public pages', async ({ request }) => {
    for (const path of localePages) {
      const res = await request.get(path);
      expect(res.ok()).toBe(true);

      const headers = res.headers();
      expect(headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(headers['x-content-type-options']).toBe('nosniff');
      expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(headers['permissions-policy']).toContain('camera=()');
      expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    }
  });

  test('private routes send noindex robots header', async ({ request }) => {
    const apiRes = await request.get('/api/health');
    expect(apiRes.ok()).toBe(true);
    expect(apiRes.headers()['x-robots-tag']).toBe('noindex, nofollow');

    const adminRes = await request.get('/admin', { failOnStatusCode: false });
    expect([200, 302, 307, 308, 500]).toContain(adminRes.status());
    expect(adminRes.headers()['x-robots-tag']).toBe('noindex, nofollow');
  });

  test('robots and sitemap do not expose private routes', async ({ request }) => {
    const robotsRes = await request.get('/robots.txt');
    expect(robotsRes.ok()).toBe(true);
    expect(robotsRes.headers()['content-type']).toContain('text/plain');
    const robots = await robotsRes.text();
    expect(robots).toContain('Disallow: /admin');
    expect(robots).toContain('Disallow: /api/');
    expect(robots).toContain('Sitemap:');

    const sitemapRes = await request.get('/sitemap.xml');
    expect(sitemapRes.ok()).toBe(true);
    expect(sitemapRes.headers()['content-type']).toContain('application/xml');
    const sitemap = await sitemapRes.text();
    expect(sitemap).toContain('<loc>');
    expect(sitemap).toContain('/hi');
    expect(sitemap).toContain('/en');
    expect(sitemap).not.toContain('/admin');
    expect(sitemap).not.toContain('/api/');
  });

  test('rss is valid xml and resists basic script injection', async ({ request }) => {
    const res = await request.get('/hi/news/rss.xml');
    expect(res.ok()).toBe(true);
    expect(res.headers()['content-type']).toContain('application/rss+xml');

    const xml = await res.text();
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<item>');
    expect(xml).not.toContain('<script');
  });
});
