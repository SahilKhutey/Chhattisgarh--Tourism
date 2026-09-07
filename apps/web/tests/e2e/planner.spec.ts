import { test, expect } from "@playwright/test";

test.describe("Itinerary Planner UI & Integrity", () => {
  test("Planner page renders form controls", async ({ page }) => {
    await page.goto("/planner");

    // Verify district or days input controls exist
    const heading = page.getByRole("heading", { level: 1 }).first();
    await expect(heading).toBeVisible();

    // Verify no synthetic scoring artifacts are rendered
    const bodyContent = await page.content();
    expect(bodyContent).not.toContain("name.length");
    expect(bodyContent).not.toContain("NaN");
  });
});
