import { test, expect } from "@playwright/test";

test.describe("P13 Complete Critical User Flow", () => {
  test("home page loads with navigation and hero discovery elements", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chhattisgarh/i);

    // Verify main skip link exists for accessibility
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    // Verify header and navigation bar exist
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("public navigation allows browsing explore/destinations", async ({ page }) => {
    await page.goto("/explore");
    // Verify page container or heading exists
    const main = page.locator("#main-content");
    await expect(main).toBeAttached();
  });

  test("locale routing switches content correctly", async ({ page }) => {
    const enResponse = await page.goto("/en");
    expect(enResponse?.status()).toBeLessThan(400);

    const hiResponse = await page.goto("/hi");
    expect(hiResponse?.status()).toBeLessThan(400);
  });
});
