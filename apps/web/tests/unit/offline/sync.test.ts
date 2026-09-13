import "fake-indexeddb/auto";
import { clearStore, STORES } from "@/lib/offline/db";
import { enqueue, getPendingQueue } from "@/lib/offline/queue";
import { queueAction, syncOfflineQueue } from "@/lib/offline/sync";

describe("Offline Sync & Conflict Handling", () => {
  beforeEach(async () => {
    await clearStore(STORES.syncQueue);
    jest.clearAllMocks();
  });

  test("deduplicates actions with identical operationId", async () => {
    const opId = "unique-op-abc-123";
    const first = await enqueue("BOOKMARK_CREATE", { placeId: "place-1" }, opId);
    const second = await enqueue("BOOKMARK_CREATE", { placeId: "place-1" }, opId);

    expect(first.id).toBe(second.id);
    expect(first.operationId).toBe(opId);

    const pending = await getPendingQueue();
    expect(pending).toHaveLength(1);
  });

  test("enforces Network-Only boundary: blocks bookings offline", async () => {
    await expect(
      queueAction("BOOKING_CREATE" as any, { placeId: "place-1" })
    ).rejects.toThrow("Transactional operations (Bookings and Payments) require an active internet connection");
  });

  test("marks queue item as conflicted when server responds with 409", async () => {
    await enqueue("ITINERARY_UPDATE", { id: "itinerary-123", title: "Updated Trip" });

    // Mock global fetch returning 409 Conflict
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 409,
      statusText: "Conflict",
    } as Response);

    try {
      const result = await syncOfflineQueue();
      expect(result.failed).toBe(1);
      expect(result.synced).toBe(0);

      const queue = await getPendingQueue();
      // Should remain in pending/failed status with conflicted or failed status
      expect(queue).toHaveLength(1);
      expect(queue[0].status).toBe("conflicted");
      expect(queue[0].attempts).toBe(1);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("successfully syncs and removes items upon HTTP 200 response", async () => {
    await enqueue("BOOKMARK_CREATE", { placeId: "place-chitrakote" });

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true }),
    } as Response);

    try {
      const result = await syncOfflineQueue();
      expect(result.synced).toBe(1);
      expect(result.failed).toBe(0);

      const queue = await getPendingQueue();
      expect(queue).toHaveLength(0);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
