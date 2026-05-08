import { test, expect } from '@playwright/test';

const locales = [
  { code: 'hi', sample: /देव नंदिनी|आपातकाल/ },
  { code: 'en', sample: /Dev Nandini|Emergency/ },
] as const;

test.describe('home page renders in both locales', () => {
  for (const { code, sample } of locales) {
    test(`/${code} renders the brand and emergency band`, async ({ page }) => {
      await page.goto(`/${code}`);
      await expect(page).toHaveURL(new RegExp(`/${code}/?$`));
      await expect(page.locator('html')).toHaveAttribute('lang', code);
      await expect(page.locator('main')).toContainText(sample);
      // Emergency phone is reachable without scroll.
      await expect(page.getByRole('link', { name: /07500246422|07500/ })).toBeVisible();
    });
  }

  test('locale switcher round-trips between hi and en', async ({ page }) => {
    await page.goto('/hi');
    await page.getByLabel('Switch to English').click();
    await expect(page).toHaveURL(/\/en\/?$/);

    await page.getByLabel('Switch to Hindi').click();
    await expect(page).toHaveURL(/\/hi\/?$/);
  });
});

test('healthcheck endpoint returns ok', async ({ request }) => {
  const response = await request.get('/api/health');
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.service).toBe('dnh-web');
});

test('root path redirects to default locale', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/hi\/?$/);
});
