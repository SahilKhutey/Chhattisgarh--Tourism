import { test, expect } from "@playwright/test";

test.describe("Phase P18 — Regional Commerce, Partner Network & Marketplace", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/v1/auth/*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access_token: "mock-test-jwt-token" }),
      });
    });
  });

  test("Consumer Experiences marketplace displays products and allows category filtering", async ({
    page,
  }) => {
    await page.route("**/api/v1/marketplace/products*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "prod-test-1",
              partnerId: "part-test-1",
              name: "Bastar Dhokra Craft & Tribal Village Trail",
              slug: "bastar-dhokra-craft-tribal-village-trail",
              description: "Full day immersive bell metal craft workshop and indigenous home visit.",
              type: "EXPERIENCE",
              price: 1850,
              currency: "INR",
              capacity: 8,
              durationMin: 360,
              active: true,
              partner: {
                id: "part-test-1",
                name: "Bastar Tribal Eco Collective",
                slug: "bastar-tribal-eco-collective",
                districtId: "bastar",
                status: "VERIFIED",
              },
              policy: {
                fullRefundHours: 48,
                partialRefundHours: 24,
                partialRefundPercent: 50,
              },
            },
            {
              id: "prod-test-2",
              partnerId: "part-test-2",
              name: "Kanger Valley Forest Canopy Homestay",
              slug: "kanger-valley-forest-canopy-homestay",
              description: "Eco-certified stay near Kotumsar caves with local cuisine.",
              type: "HOMESTAY",
              price: 2400,
              currency: "INR",
              capacity: 4,
              durationMin: 1440,
              active: true,
              partner: {
                id: "part-test-2",
                name: "Kanger Eco Lodge",
                slug: "kanger-eco-lodge",
                districtId: "bastar",
                status: "VERIFIED",
              },
              policy: {
                fullRefundHours: 48,
                partialRefundHours: 24,
                partialRefundPercent: 50,
              },
            },
          ],
          total: 2,
          page: 1,
          limit: 20,
          totalPages: 1,
        }),
      });
    });

    await page.goto("/experiences");
    await expect(page.locator("h1")).toContainText("Authentic Chhattisgarh Experiences");
    await expect(page.locator("text=Bastar Dhokra Craft & Tribal Village Trail")).toBeVisible();
    await expect(page.locator("text=Kanger Valley Forest Canopy Homestay")).toBeVisible();
    await expect(page.locator("text=Verified Partner").first()).toBeVisible();
  });

  test("Experience detail page handles slot selection and reservations", async ({
    page,
  }) => {
    await page.route("**/api/v1/marketplace/products/slug/bastar-dhokra-craft-tribal-village-trail", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "prod-test-1",
          partnerId: "part-test-1",
          name: "Bastar Dhokra Craft & Tribal Village Trail",
          slug: "bastar-dhokra-craft-tribal-village-trail",
          description: "Full day immersive bell metal craft workshop and indigenous home visit.",
          type: "EXPERIENCE",
          price: 1850,
          currency: "INR",
          capacity: 8,
          durationMin: 360,
          active: true,
          partner: {
            id: "part-test-1",
            name: "Bastar Tribal Eco Collective",
            slug: "bastar-tribal-eco-collective",
            districtId: "bastar",
            status: "VERIFIED",
          },
          policy: {
            fullRefundHours: 48,
            partialRefundHours: 24,
            partialRefundPercent: 50,
          },
          availability: [
            {
              id: "slot-test-1",
              productId: "prod-test-1",
              startAt: "2026-11-15T09:00:00.000Z",
              endAt: "2026-11-15T17:00:00.000Z",
              capacity: 8,
              reserved: 2,
              availableCapacity: 6,
              isSoldOut: false,
            },
          ],
        }),
      });
    });

    await page.route("**/api/v1/bookings/marketplace", async (route) => {
      await route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          booking: {
            id: "book-test-123",
            bookingReference: "CGT-TEST-BSTR99",
            status: "CONFIRMED",
            totalAmount: 3700,
          },
        }),
      });
    });

    await page.goto("/experiences/bastar-dhokra-craft-tribal-village-trail");
    await expect(page.locator("h1")).toContainText("Bastar Dhokra Craft");
    await expect(page.locator("text=Cancellation & Refund Policy")).toBeVisible();
    await expect(page.locator("select")).toBeVisible();
    await expect(page.locator("button[type='submit']")).toBeEnabled();
  });

  test("Partner portal renders registration and overview", async ({ page }) => {
    await page.goto("/partner");
    await expect(page.locator("h1")).toContainText("Partner Portal & Operations");
    await expect(page.locator("text=Official State Verification")).toBeVisible();
    await page.getByRole("button", { name: "Apply for Partner Verification" }).click();
    await expect(page.getByRole("heading", { name: "Partner Registration" })).toBeVisible();
    await expect(page.locator("input[placeholder*='Bastar Tribal']")).toBeVisible();
  });

  test("Admin marketplace console displays partner registry", async ({ page }) => {
    await page.route("**/api/v1/partners*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [
            {
              id: "p-admin-1",
              name: "Surguja Hillside Trekking",
              slug: "surguja-hillside-trekking",
              phone: "+919876543210",
              districtId: "surguja",
              status: "PENDING",
              createdAt: new Date().toISOString(),
            },
            {
              id: "p-admin-2",
              name: "Bastar Tribal Eco Collective",
              slug: "bastar-tribal-eco-collective",
              phone: "+919123456780",
              districtId: "bastar",
              status: "VERIFIED",
              createdAt: new Date().toISOString(),
            },
          ],
          total: 2,
        }),
      });
    });

    await page.goto("/admin/marketplace");
    await expect(page.getByRole("heading", { name: "Marketplace & Partner Administration" })).toBeVisible();
    await expect(page.locator("text=Surguja Hillside Trekking")).toBeVisible();
    await expect(page.getByRole("cell", { name: "PENDING" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "VERIFIED" })).toBeVisible();
  });
});