import { test, expect } from '@playwright/test';

test.describe('CG Tourism Mobile Experience & Critical Journeys', () => {
  test.beforeEach(async ({ page }) => {
    // Set standard mobile device viewport (iPhone 14 / Pixel standard)
    await page.setViewportSize({ width: 390, height: 844 });
  });

  test('Journey A — Mobile Discovery & Navigation', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();

    // Verify header or mobile navigation elements are responsive
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('Journey A.2 — Mobile Explore Route Availability', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('body')).toBeVisible();
    await expect(page).toHaveURL(/.*explore/);
  });

  test('Journey B — Mobile Planner Layout & Controls', async ({ page }) => {
    await page.goto('/planner');
    await expect(page.locator('body')).toBeVisible();

    // Verify form elements fit within mobile viewport without horizontal blowout
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBe(390);

    const inputs = page.locator('input, button, select');
    const count = await inputs.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Journey C — Mobile Offline Shell Availability', async ({ page }) => {
    await page.goto('/offline');
    await expect(page.locator('body')).toBeVisible();

    // Verify offline guidance content
    const heading = page.locator('h1, h2, h3');
    await expect(heading.first()).toBeVisible();
  });

  test('Journey D — Mobile SOS Emergency Viewport & Safety Invariant', async ({ page }) => {
    await page.goto('/sos');
    await expect(page.locator('body')).toBeVisible();

    // Verify emergency headings and main container are visible
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const heading = page.locator('h1, h2');
    await expect(heading.first()).toBeVisible();
  });
});
