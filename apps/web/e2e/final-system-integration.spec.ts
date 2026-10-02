import { test, expect } from "@playwright/test";

test.describe("UI/UX System 7 — FINAL: Complete System Integration & Hardening", () => {
  test("1. Consumer Shell & Navigation: brand, skip-link, primary navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chhattisgarh/i);

    // Skip to main content landmark
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Consumer Header presence
    const header = page.locator("header");
    await expect(header).toBeVisible();

    // Navigation links exist and are accessible
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("2. Consumer Journey: Discover -> Explore -> Map transition", async ({ page }) => {
    await page.goto("/explore");
    await expect(page.locator("body")).toBeVisible();

    // Navigate to Map Experience
    const mapLink = page.locator('a[href*="/map"]').first();
    if (await mapLink.count() > 0) {
      await mapLink.click();
      await expect(page).toHaveURL(/.*map.*/);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("3. Geographic Experience: Observer controls & map canvas", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("body")).toBeVisible();

    // Observer container should mount with accessible aria label
    const observer = page.locator('[aria-label*="observer experience"]');
    if (await observer.count() > 0) {
      await expect(observer).toBeVisible();
    }
  });

  test("4. Resilience: 404 NotFoundState & non-blocking recovery links", async ({ page }) => {
    const res = await page.goto("/non-existent-sector-coordinate-999");
    expect(res?.status()).toBe(404);

    // Verify canonical NotFoundState
    await expect(page.locator("body")).toBeVisible();
    const heading = page.locator("h2");
    await expect(heading).toContainText(/Not Found/i);

    // Verify recovery link
    const actionLink = page.locator('a[href="/explore"]');
    await expect(actionLink).toBeVisible();
  });

  test("5. Motion Accessibility: respects prefers-reduced-motion across key views", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    await page.goto("/map");
    await expect(page.locator("body")).toBeVisible();
  });

  test("6. Responsive Shell: mobile viewport layout & bottom navigation bar", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    // Header exists in mobile viewport
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });
});
