import { expect, test } from '@playwright/test';

test.describe('ui and ux regression', () => {
  test('skip link is keyboard reachable and targets main content', async ({ page }) => {
    await page.goto('/hi');

    // First tab stop should expose the skip link for keyboard users.
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: /मुख्य सामग्री पर जाएँ|Skip to content/i });
    await expect(skip).toBeVisible();

    await skip.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  test('header exposes emergency, search, and locale controls', async ({ page }) => {
    await page.goto('/hi');
    await expect(page.locator('header a[href="tel:07500246422"]').first()).toBeVisible();
    await expect(page.locator('header a[href="/hi/search"]')).toBeVisible();
    await expect(page.getByLabel('Switch to English')).toBeVisible();
  });

  test('mobile nav trigger is present with dialog semantics', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/en');
    const trigger = page.getByRole('button', { name: /Open menu/i });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  test('contact form exposes required labeled controls', async ({ page }) => {
    await page.goto('/en/contact');
    await expect(page.getByLabel('Name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Topic')).toBeVisible();
    await expect(page.getByLabel('Message')).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveAttribute('required', '');
    await expect(page.getByLabel('Email')).toHaveAttribute('required', '');
    await expect(page.getByLabel('Topic')).toHaveAttribute('required', '');
    await expect(page.getByLabel('Message')).toHaveAttribute('required', '');
    await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
  });

  test('search page renders grouped results for bilingual input', async ({ page }) => {
    await page.goto('/hi/search?q=हृदय');

    await expect(page.getByRole('heading', { name: 'खोज' })).toBeVisible();
    await expect(page.locator('main').getByText('चिकित्सक', { exact: true }).first()).toBeVisible();
    await expect(page.locator('main').getByText('विभाग', { exact: true }).first()).toBeVisible();
    await expect(page.locator('main').getByText('पाठ्यक्रम', { exact: true }).first()).toBeVisible();
    await expect(
      page.locator('main a[href*="/patients/departments/"], main a[href*="/academics/programs/"]').first(),
    ).toBeVisible();
  });
});
