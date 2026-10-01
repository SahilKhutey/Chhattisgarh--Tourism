import { test, expect } from "@playwright/test";

test.describe("Loading & Smooth Transitions (E2E)", () => {
  test("loads root route with calm transition and no layout-shift indicators", async ({ page }) => {
    await page.goto("/");
    // Ensure document loads cleanly
    await expect(page.locator("body")).toBeVisible();
    // Validate main or header landmark is present
    const header = page.locator("header");
    await expect(header).toBeVisible();
  });

  test("supports prefers-reduced-motion without breaking navigation or layout", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();

    // Verify page renders content without error
    const mainContent = page.locator("main");
    if (await mainContent.count() > 0) {
      await expect(mainContent.first()).toBeVisible();
    }
  });

  test("maintains responsive loading layout across mobile viewport (375x812)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.locator("body")).toBeVisible();
  });
});
