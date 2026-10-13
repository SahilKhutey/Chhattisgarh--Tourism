import { test, expect } from "@playwright/test";

test.describe("Template Builder", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/*", async (route) => {
      const url = route.request().url();
      const origin = route.request().headers()["origin"] || "http://127.0.0.1:3000";
      const corsHeaders = {
        "access-control-allow-origin": origin,
        "access-control-allow-credentials": "true",
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
        "access-control-allow-headers": "Content-Type, Authorization, *",
      };

      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 204,
          headers: corsHeaders,
        });
        return;
      }

      if (
        url.includes("/admin/templates/") &&
        !url.includes("/builder") &&
        !url.includes("/versions")
      ) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          headers: corsHeaders,
          body: JSON.stringify({
            id: "test-template",
            name: "Test Template",
            slug: "test-template",
            version: 1,
            status: "DRAFT",
            fields: [],
          }),
        });
        return;
      }
      await route.continue();
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
      page
        .getByLabel("Template field palette")
        .getByRole("heading", { name: "Fields" }),
    ).toBeVisible();

    // Verify presence of canonical buttons
    await expect(
      page.getByRole("button", { name: "+ Text", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "+ Geo Point", exact: true }),
    ).toBeVisible();
  });

  test("adds a text field and shows unsaved state", async ({
    page,
  }) => {
    await page.goto("/admin/templates/test-template/builder");

    const addTextBtn = page.getByRole("button", {
      name: "+ Text",
      exact: true,
    });
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
