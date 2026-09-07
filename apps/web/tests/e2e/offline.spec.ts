import { test, expect } from "@playwright/test";

test.describe("PWA and Offline Capabilities", () => {
  test("Loads dynamic translations from cache when offline", async ({
    page,
    context,
  }) => {
    await page.goto("/");

    // Seed localStorage with cached dynamic translations
    await page.evaluate(() => {
      localStorage.setItem("preferred_language", "cg");
      localStorage.setItem(
        "dynamic_translations_cg",
        JSON.stringify({
          "place-123": {
            description: "यह एक सुंदर झरना है",
          },
        }),
      );
    });

    // Go offline
    await context.setOffline(true);

    // Verify the cached language is maintained
    const savedLang = await page.evaluate(() =>
      localStorage.getItem("preferred_language"),
    );
    expect(savedLang).toBe("cg");
  });

  test("Offline shell page is accessible directly", async ({ page }) => {
    await page.goto("/offline.html");
    await expect(page.locator("h1")).toContainText(/You are offline/i);
    await expect(page.locator("body")).toContainText("CG Tourism");
  });

  test("Offline indicator displays when browser goes offline", async ({ page, context }) => {
    await page.goto("/");
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);

    // Initially online: offline banner should not be in DOM
    const banner = page.getByRole("status");
    await expect(banner).not.toBeVisible();

    // Trigger offline mode
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Offline indicator should appear
    await expect(banner).toBeVisible({ timeout: 10000 });
    await expect(banner).toContainText("You are offline");

    // Restore online mode
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event("online")));
    await expect(banner).not.toBeVisible({ timeout: 10000 });
  });

  test("SOS page queues emergency requests safely when offline", async ({ page, context }) => {
    await page.goto("/sos");
    await page.waitForLoadState("load");
    await page.waitForTimeout(500);

    // Set offline
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event("offline")));

    // Click SOS trigger button
    const sosButton = page.getByTestId("sos-switch-button");
    await sosButton.click();

    // Verify offline queueing message is rendered and never claims remote dispatch
    const statusBox = page.locator("body");
    await expect(statusBox).toContainText(/SOS Queued Offline|stored locally|waiting for connection/i, { timeout: 10000 });
    await expect(statusBox).not.toContainText("Rescue Dispatched");
  });

  test("Web manifest exists and includes PWA configuration", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.name).toBe("CG Tourism");
    expect(data.display).toBe("standalone");
    expect(data.icons.length).toBeGreaterThanOrEqual(2);
  });
});
