import { test, expect } from "@playwright/test";

test.describe("Geographic Experience Layer (Observer Style)", () => {
  test("loads map page with observer UI and controls", async ({ page }) => {
    await page.goto("/map");

    // Wait for page to settle
    await page.waitForLoadState("domcontentloaded");

    // Check main container and landmark
    const mainSection = page.locator("section[aria-label*='map' i], main");
    await expect(mainSection.first()).toBeVisible();

    // Check observer controls or map canvas
    const mapCanvas = page.locator(".leaflet-container, section[aria-label*='map' i]");
    await expect(mapCanvas.first()).toBeVisible();
  });

  test("supports mobile viewport with responsive layout", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/map");

    await page.waitForLoadState("domcontentloaded");

    const mapElement = page.locator(".leaflet-container, section[aria-label*='map' i]");
    await expect(mapElement.first()).toBeVisible();
  });
});
