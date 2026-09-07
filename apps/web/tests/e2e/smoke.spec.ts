import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("Homepage loads successfully and renders hero section", async ({
    page,
  }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);

    // Verify page title or primary headline exists
    await expect(page).toHaveTitle(/Chhattisgarh/i);

    // Check that main element or key hero element is rendered
    const mainContent = page.locator('main, [role="main"]').first();
    await expect(mainContent).toBeVisible();
  });

  test("Page contains accessible navigation links", async ({ page }) => {
    await page.goto("/");

    // Check presence of navigation links
    const exploreLink = page.locator('a[href*="/explore"]').first();
    await expect(exploreLink).toBeAttached();
  });
});
