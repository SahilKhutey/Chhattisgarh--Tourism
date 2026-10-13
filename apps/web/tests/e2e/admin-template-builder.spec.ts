import { test, expect } from "@playwright/test";

test.describe("Template Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/admin/templates/**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "test-template",
          name: "Test Template",
          slug: "test-template",
          version: 1,
          status: "DRAFT",
          fields: [],
        }),
      });
    });
  });

  test("opens builder and displays field palette and canvas", async ({
    page,
  }) => {
    // Navigate to a builder page
    const res = await page.goto("/admin/templates/new/builder");
    expect(res?.status()).toBeLessThan(500);

    // Verify fields palette
    await expect(
      page.getByText("Fields", { exact: true }),
    ).toBeVisible();

    // Verify presence of canonical buttons
    await expect(
      page.getByRole("button", { name: "+ Text" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "+ Geo Point" }),
    ).toBeVisible();
  });

  test("adds a text field and shows unsaved state", async ({
    page,
  }) => {
    await page.goto("/admin/templates/test-template/builder");

    const addTextBtn = page.getByRole("button", { name: "+ Text" });
    await expect(addTextBtn).toBeVisible();
    await addTextBtn.click();

    await expect(
      page.getByText("Unsaved changes"),
    ).toBeVisible();

    await expect(
      page.getByRole("button", { name: "Save" }),
    ).toBeEnabled();
  });
});
