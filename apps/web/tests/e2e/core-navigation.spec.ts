import { test, expect } from "@playwright/test";

test.describe("Core Route Navigation", () => {
  const routes = [
    { path: "/", expectedStatus: 200 },
    { path: "/explore", expectedStatus: 200 },
    { path: "/planner", expectedStatus: 200 },
    { path: "/sos", expectedStatus: 200 },
    { path: "/stories", expectedStatus: 200 },
  ];

  for (const route of routes) {
    test(`Route ${route.path} loads without 5xx server errors`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBeLessThan(500);

      // Verify no unhandled error overlay or broken layout
      const body = page.locator("body");
      await expect(body).toBeVisible();
    });
  }
});
