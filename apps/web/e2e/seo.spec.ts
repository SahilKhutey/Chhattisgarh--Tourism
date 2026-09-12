import { test, expect } from "@playwright/test";

test.describe("P13 SEO & Metadata Verification", () => {
  test("homepage has title and meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Chhattisgarh/i);

    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(10);
  });

  test("homepage has OpenGraph tags", async ({ page }) => {
    await page.goto("/");
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toBeTruthy();

    const ogType = await page.locator('meta[property="og:type"]').getAttribute("content");
    expect(ogType).toBeTruthy();
  });

  test("manifest webmanifest link is present", async ({ page }) => {
    await page.goto("/");
    const manifest = page.locator('link[rel="manifest"]');
    await expect(manifest).toBeAttached();
  });
});
