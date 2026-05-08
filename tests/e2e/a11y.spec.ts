import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/hi', '/en', '/hi/contact', '/en/contact'] as const;

/**
 * WCAG 2.2 AA budget. Medical institution sites have a real obligation here;
 * any violation fails CI.
 */
test.describe('accessibility (axe-core)', () => {
  for (const path of PAGES) {
    test(`${path} has no detectable WCAG 2.2 AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      // Surface the offenders in the test output before failing.
      if (results.violations.length > 0) {
        console.error(
          `axe violations on ${path}:`,
          results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })),
        );
      }
      expect(results.violations).toEqual([]);
    });
  }
});
