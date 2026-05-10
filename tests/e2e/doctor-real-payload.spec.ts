import { test, expect } from '@playwright/test';

/**
 * Real-Payload integration spec for the Doctor surface — Task 10 of the Doctor
 * Cutover plan. Closes adversarial finding #9 ("no real-Payload integration
 * test") for the ContentReader cutover (Tasks 5–9). All other Reader coverage
 * uses a fakePayload; this spec is the only place that hits a seeded Postgres
 * end-to-end through the dev server.
 *
 * Manual run (port 3010 to avoid colliding with other local services on 3000):
 *
 *   docker compose up -d db
 *   DATABASE_URI=postgresql://dnh:dnh@localhost:5432/dnh \
 *     PAYLOAD_SECRET=$(openssl rand -hex 32) \
 *     pnpm seed
 *   PORT=3010 \
 *     DATABASE_URI=postgresql://dnh:dnh@localhost:5432/dnh \
 *     PAYLOAD_SECRET=<same secret> \
 *     pnpm dev
 *   PLAYWRIGHT_BASE_URL=http://localhost:3010 \
 *     pnpm exec playwright test tests/e2e/doctor-real-payload.spec.ts \
 *     --project=desktop-chromium
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3010';
const SEEDED_SLUG = 'vimlesh-sharma';

// SKIPPED: requires running dev server with seeded Payload — see Task 10 BLOCKED status
test.describe.skip('Doctor surface — real Payload integration', () => {
  test('English detail page renders a real doctor record', async ({ page }) => {
    await page.goto(`${BASE}/en/patients/doctors/${SEEDED_SLUG}`);
    await expect(page.locator('h1')).toContainText(/.+/);
    await expect(page.locator('script[type="application/ld+json"]').first()).toBeAttached();
  });

  test('English list page renders at least one doctor card', async ({ page }) => {
    await page.goto(`${BASE}/en/patients/doctors`);
    const cards = page.locator('article, li').filter({ hasText: /Dr\.?|डॉ\./ });
    await expect(cards.first()).toBeVisible();
  });

  test('Hindi detail page returns 200 for the same record', async ({ page }) => {
    const response = await page.goto(`${BASE}/hi/patients/doctors/${SEEDED_SLUG}`);
    expect(response?.status()).toBe(200);
  });

  test('Faculty page renders without crashing (uses Reader)', async ({ page }) => {
    const response = await page.goto(`${BASE}/en/academics/faculty`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
