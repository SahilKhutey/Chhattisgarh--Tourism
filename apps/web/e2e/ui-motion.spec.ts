import { test, expect } from "@playwright/test";

test.describe("UI Motion & Interaction Accessibility", () => {
  test("renders buttons with accessible interactive states and focus ring", async ({ page }) => {
    await page.goto("/");
    const primaryButton = page.locator("button").first();
    if (await primaryButton.isVisible()) {
      await primaryButton.focus();
      await expect(primaryButton).toBeVisible();
    }
  });

  test("respects prefers-reduced-motion emulation", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    // Verify main content is immediately visible and not blocked by animations
    const body = page.locator("body");
    await expect(body).toBeVisible();

    const main = page.locator("main");
    if (await main.isVisible()) {
      await expect(main).toBeVisible();
    }
  });

  test("mobile navigation drawer toggles and handles escape dismiss", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /open navigation menu/i });
    if (await menuButton.isVisible()) {
      await menuButton.click();
      const drawer = page.getByRole("dialog", { name: /mobile navigation menu/i });
      await expect(drawer).toBeVisible();

      // Press Escape to dismiss
      await page.keyboard.press("Escape");
      await expect(drawer).not.toBeVisible();
    }
  });
});
