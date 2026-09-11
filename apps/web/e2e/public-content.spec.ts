import { test, expect } from "@playwright/test";

test.describe("Public Tourism Content & Dynamic Rendering", () => {
  test("unknown destination returns 404", async ({ page }) => {
    const response = await page.goto("/en/destinations/does-not-exist-xyz");
    expect(response?.status()).toBe(404);
  });

  test("draft preview page blocks unauthenticated anonymous user", async ({ page }) => {
    const response = await page.goto("/preview/00000000-0000-0000-0000-000000000000");
    expect(response?.status()).toBe(404);
  });

  test("robots.txt disallows admin and preview endpoints", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("Disallow: /admin/");
    expect(text).toContain("Disallow: /preview/");
    expect(text).toContain("sitemap.xml");
  });

  test("sitemap.xml includes multilingual paths", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const text = await response.text();
    expect(text).toContain("<url>");
    expect(text).toContain("/en");
    expect(text).toContain("/hi");
    expect(text).toContain("/chg");
  });
});
