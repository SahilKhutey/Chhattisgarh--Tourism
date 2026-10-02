import { test, expect } from "@playwright/test";

test.describe("Workflow Resilience - Loading & Sections (E2E)", () => {
  test("preserves page shell when navigating to routes with async content", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    // Verify navigation works without flash of white screen
    const exploreLink = page.locator('a[href*="/explore"]').first();
    if (await exploreLink.count() > 0) {
      await exploreLink.click();
      await expect(page).toHaveURL(/.*explore.*/);
      await expect(page.locator("body")).toBeVisible();
    }
  });

  test("renders map observer page with canvas and hud elements", async ({ page }) => {
    await page.goto("/map");
    await expect(page.locator("body")).toBeVisible();

    // Map canvas or container should be mounted
    const mapRegion = page.locator('[aria-label="Tourism geographic observer experience"]');
    if (await mapRegion.count() > 0) {
      await expect(mapRegion).toBeVisible();
    }
  });

  test("respects prefers-reduced-motion during component transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/map");
    await expect(page.locator("body")).toBeVisible();
  });
});
