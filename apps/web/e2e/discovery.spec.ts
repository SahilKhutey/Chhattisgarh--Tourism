import { test, expect } from "@playwright/test";

test.describe("Tourism Intelligence & Discovery Platform", () => {
  test("renders discover page and search elements", async ({ page }) => {
    await page.goto("/en/discover");

    // Check hero header
    await expect(
      page.getByRole("heading", { name: /discover the heart of india/i })
    ).toBeVisible();

    // Check search input
    const input = page.getByPlaceholder(/search experiences, moods, themes/i);
    await expect(input).toBeVisible();

    // Check hybrid mode selector
    await expect(page.getByRole("button", { name: /hybrid ai/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /exact match/i })).toBeVisible();
  });

  test("executes hybrid semantic search and updates URL", async ({ page }) => {
    await page.goto("/en/discover");

    const input = page.getByPlaceholder(/search experiences, moods, themes/i);
    await input.fill("waterfalls in Bastar");

    const searchBtn = page.getByRole("button", { name: /^search$/i });
    await searchBtn.click();

    // URL should reflect query
    await expect(page).toHaveURL(/q=waterfalls/);
  });

  test("toggles search modes between hybrid and exact match", async ({ page }) => {
    await page.goto("/en/discover");

    const exactMatchBtn = page.getByRole("button", { name: /exact match/i });
    await exactMatchBtn.click();

    const hybridBtn = page.getByRole("button", { name: /hybrid ai/i });
    await hybridBtn.click();

    await expect(hybridBtn).toBeVisible();
  });

  test("filters by popular tourism category", async ({ page }) => {
    await page.goto("/en/discover");

    // Click on a category pill like "Waterfalls" if present
    const categoryPill = page.getByRole("button", { name: /^waterfalls$/i });
    if (await categoryPill.isVisible()) {
      await categoryPill.click();
      await expect(page).toHaveURL(/category=Waterfalls/);
    }
  });
});
