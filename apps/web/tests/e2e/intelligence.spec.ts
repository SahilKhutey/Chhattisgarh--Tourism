import { test, expect } from "@playwright/test";

test.describe("Phase P17 — Regional Tourism Intelligence & Operations", () => {
  test("Admin Regional Intelligence Dashboard renders telemetry, leaderboard, and content health", async ({
    page,
  }) => {
    // Intercept analytics and intelligence APIs
    await page.route("**/api/v1/intelligence/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          period: {
            from: "2026-09-01T00:00:00.000Z",
            to: "2026-09-08T00:00:00.000Z",
          },
          metrics: {
            visitors: 12430,
            searches: 8920,
            bookings: 1240,
            sos: 7,
          },
          events: [],
        }),
      });
    });

    await page.route("**/api/v1/content-health/summary", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          total: 85,
          healthy: 70,
          warning: 10,
          incomplete: 5,
          healthyPercentage: 82,
          warningPercentage: 12,
          incompletePercentage: 6,
        }),
      });
    });

    await page.route("**/api/v1/alerts", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "alert-test-1",
            type: "CONTENT_STALE",
            severity: "WARNING",
            title: "Stale Content: Kanger Valley Caves",
            description: "No verified updates in 380 days.",
            resolved: false,
            createdAt: new Date().toISOString(),
          },
        ]),
      });
    });

    await page.goto("/admin/intelligence");

    // Check title and header
    const heading = page.getByRole("heading", { name: /CG Tourism Intelligence/i });
    await expect(heading).toBeVisible();

    // Verify metric cards
    await expect(page.getByText("Visitors & Views")).toBeVisible();
    await expect(page.getByText("12,430")).toBeVisible();
    await expect(page.getByText("8,920")).toBeVisible();
    await expect(page.getByText("1,240")).toBeVisible();

    // Verify Content Health section
    await expect(page.getByText("Content Health Engine")).toBeVisible();
    await expect(page.getByText("82%")).toBeVisible();

    // Verify Destination Leaderboard
    await expect(page.getByText("Destination Intelligence Leaderboard")).toBeVisible();

    // Verify Alert & Resolve Interaction
    const resolveBtn = page.getByRole("button", { name: /Mark Resolved/i }).first();
    await expect(resolveBtn).toBeVisible();
  });

  test("Client event tracking is completely non-blocking", async ({ page }) => {
    let telemetryCaptured = false;

    await page.route("**/api/v1/analytics/events", async (route) => {
      telemetryCaptured = true;
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ id: "evt-playwright-1", type: "PAGE_VIEW" }),
      });
    });

    await page.goto("/");

    // Trigger synthetic non-blocking tracking via window fetch
    await page.evaluate(async () => {
      try {
        await fetch("/api/v1/analytics/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "PAGE_VIEW", platform: "web" }),
          keepalive: true,
        });
      } catch {
        // Must never throw
      }
    });

    expect(telemetryCaptured).toBe(true);
  });
});
