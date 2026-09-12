import { test, expect } from "@playwright/test";

test.describe("P13 Accessibility Verification", () => {
  test("skip-to-content link exists and targets main content", async ({ page }) => {
    await page.goto("/");
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();

    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeAttached();
    await expect(mainContent).toHaveAttribute("tabindex", "-1");
  });

  test("landmarks exist: navigation, main, and contentinfo footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("main#main-content")).toBeAttached();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("html root has valid lang attribute", async ({ page }) => {
    await page.goto("/");
    const htmlLang = await page.locator("html").getAttribute("lang");
    expect(htmlLang).toBeTruthy();
  });
});
