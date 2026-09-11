import { test, expect } from "@playwright/test";

test.describe("P9 Admin", () => {
  test("opens glossary", async ({ page }) => {
    await page.goto("/admin/glossary");
    await expect(
      page.getByRole("heading", { name: "Glossary" }),
    ).toBeVisible();
  });

  test("opens accessibility dashboard", async ({ page }) => {
    await page.goto("/admin/accessibility");
    await expect(
      page.getByRole("heading", { name: "Accessibility" }),
    ).toBeVisible();
  });
});
