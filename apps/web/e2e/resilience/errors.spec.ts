import { test, expect } from "@playwright/test";

test.describe("Workflow Resilience - Errors & Breakdowns (E2E)", () => {
  test("displays canonical 404 destination not found on non-existent route", async ({ page }) => {
    const response = await page.goto("/destination-not-found-random-slug-999");
    expect(response?.status()).toBe(404);

    // Verify NotFoundState content rendered
    await expect(page.locator("body")).toBeVisible();
    const heading = page.locator("h2");
    await expect(heading).toContainText(/Destination Not Found/i);

    // Verify recovery link to return to exploration
    const actionLink = page.locator('a[href="/explore"]');
    await expect(actionLink).toBeVisible();
  });

  test("maintains accessible alert roles during error presentation", async ({ page }) => {
    await page.goto("/destination-not-found-random-slug-999");
    const notFoundRegion = page.locator('[role="region"][aria-label*="Content not found notice"]');
    await expect(notFoundRegion).toBeVisible();
  });
});
