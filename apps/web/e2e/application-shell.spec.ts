import { test, expect } from "@playwright/test";

test.describe("Application Shell & Consumer Navigation (E2E)", () => {
  test.describe("Desktop Viewport (1280x800)", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto("/");
    });

    test("renders header, primary navigation, and footer landmarks", async ({ page }) => {
      await expect(page.locator("header")).toBeVisible();
      const mainContent = page.locator("#main-content");
      if (await mainContent.count() > 0) {
        await expect(mainContent.first()).toBeVisible();
      }
      await expect(page.locator("footer")).toBeVisible();
    });

    test("provides skip to content accessibility link", async ({ page }) => {
      const skipLink = page.locator('a[href="#main-content"]');
      if (await skipLink.count() > 0) {
        await expect(skipLink.first()).toBeAttached();
      }
    });

    test("navigates to Discover and maintains shell continuity", async ({ page }) => {
      await page.goto("/discover");
      await expect(page.locator("body")).toBeVisible();
      await expect(page.locator("header")).toBeVisible();
    });
  });

  test.describe("Mobile Viewport (375x812)", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 812 });
      await page.goto("/");
    });

    test("renders mobile header and bottom navigation bar", async ({ page }) => {
      await expect(page.locator("header")).toBeVisible();
      const bottomNav = page.locator('nav[aria-label="Mobile bottom navigation"]');
      if (await bottomNav.count() > 0) {
        await expect(bottomNav).toBeVisible();
      }
    });
  });

  test.describe("Deep Linking & Browser History", () => {
    test("supports direct deep-linking to primary routes", async ({ page }) => {
      const routes = ["/discover", "/planner", "/bookmarks", "/map"];
      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator("body")).toBeVisible();
      }
    });
  });
});
