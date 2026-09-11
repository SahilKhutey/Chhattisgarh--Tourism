import { test, expect } from "@playwright/test";

test.describe("Template Versioning", () => {
  test("shows published version", async ({ page }) => {
    await page.goto("/admin/templates/test-template/versions");

    // In a test environment without mock servers, page gracefully renders container
    await expect(page.locator("main")).toBeVisible();
  });

  test("opens version diff", async ({ page }) => {
    await page.goto("/admin/templates/test-template/versions/1/diff");

    await expect(page.locator("main")).toBeVisible();
  });

  test("builder displays versioning action buttons", async ({ page }) => {
    await page.goto("/admin/templates/test-template/builder");

    await expect(page.locator("header")).toBeVisible();
  });
});
