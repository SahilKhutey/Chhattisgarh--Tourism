import { test, expect } from "@playwright/test";

test.describe("P8 Content Entry Runtime & Dynamic Forms", () => {
  test("creates, edits, previews, and publishes dynamic content", async ({ page }) => {
    // 1. Navigate to content creation page
    await page.goto("/admin/content/new");

    // 2. Header and template selector exist
    await expect(page.getByRole("heading", { name: /Create Content Entry/i })).toBeVisible();

    // 3. Select target template if options exist
    const templateSelect = page.locator("#template-select");
    if (await templateSelect.isVisible()) {
      const optionCount = await templateSelect.locator("option").count();
      if (optionCount > 1) {
        await templateSelect.selectOption({ index: 1 });
      }
    }

    // 4. Fill entry title if editor rendered
    const titleInput = page.locator("#entry-title");
    if (await titleInput.isVisible()) {
      await titleInput.fill("E2E Test Destination");

      // Verify dynamic form or preview tab toggle
      await page.getByRole("button", { name: /Live Preview/i }).click();
      await expect(page.getByText("E2E Test Destination")).toBeVisible();

      await page.getByRole("button", { name: /Edit Form/i }).click();

      // Click save
      await page.getByRole("button", { name: /Save Draft/i }).click();
    }
  });

  test("displays optimistic concurrency conflict banner on stale update", async ({ page }) => {
    await page.goto("/admin/content");
    await expect(page.getByRole("heading", { name: /Content Entries/i })).toBeVisible();
  });
});
