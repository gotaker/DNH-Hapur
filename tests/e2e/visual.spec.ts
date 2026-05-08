import { test, expect } from '@playwright/test';

/**
 * Visual regression on the home page in both locales. Screenshots are stored
 * in tests/e2e/__screenshots__/. Update with: pnpm test:e2e --update-snapshots
 *
 * Animations and motion are disabled to keep diffs stable.
 */
test.describe('home page visual regression', () => {
  for (const locale of ['hi', 'en'] as const) {
    test(`/${locale} matches snapshot`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      // Let fonts and hero image settle.
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveScreenshot(`home-${locale}.png`, {
        fullPage: true,
        maxDiffPixelRatio: 0.02,
      });
    });
  }
});
