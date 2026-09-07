import "fake-indexeddb/auto";
import { clearStore, getAll, STORES } from "@/lib/offline/db";
import { triggerSOS } from "@/lib/offline/sos";
import type { SyncQueueItem } from "@/lib/offline/types";

describe("Offline SOS Invariant Tests", () => {
  beforeEach(async () => {
    await clearStore(STORES.syncQueue);
    jest.restoreAllMocks();
  });

  test("when navigator is offline, queues action and returns queued status (never sent)", async () => {
    // Simulate offline
    Object.defineProperty(navigator, "onLine", {
      value: false,
      configurable: true,
    });

    const payload = {
      touristName: "Test Traveler",
      touristPhone: "9999999999",
      latitude: 19.201,
      longitude: 81.701,
      timestamp: new Date().toISOString(),
    };

    const result = await triggerSOS(payload);

    expect(result.status).toBe("queued");
    expect(result.message).toBe("SOS request stored locally — waiting for connection");

    const queuedItems = await getAll<SyncQueueItem>(STORES.syncQueue);
    expect(queuedItems).toHaveLength(1);
    expect(queuedItems[0].action).toBe("SOS_CREATE");
    expect((queuedItems[0].payload as any).touristName).toBe("Test Traveler");
  });

  test("when online and network request succeeds, returns sent status", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });

    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        referenceId: "SOS-REF-12345",
        etaMinutes: 12,
        message: "Dispatch unit assigned",
      }),
    });

    const payload = {
      touristName: "Online Traveler",
      touristPhone: "8888888888",
      latitude: 19.201,
      longitude: 81.701,
      timestamp: new Date().toISOString(),
    };

    const result = await triggerSOS(payload);

    expect(result.status).toBe("sent");
    expect(result.referenceId).toBe("SOS-REF-12345");
    expect(result.etaMinutes).toBe(12);

    // Verify nothing queued in syncQueue since it succeeded remotely
    const queuedItems = await getAll<SyncQueueItem>(STORES.syncQueue);
    expect(queuedItems).toHaveLength(0);
  });

  test("when online but fetch throws network failure, enqueues locally and returns queued status", async () => {
    Object.defineProperty(navigator, "onLine", {
      value: true,
      configurable: true,
    });

    global.fetch = jest.fn().mockRejectedValueOnce(new Error("Failed to fetch"));

    const payload = {
      touristName: "Emergency User",
      touristPhone: "7777777777",
      latitude: 19.5,
      longitude: 81.9,
      timestamp: new Date().toISOString(),
    };

    const result = await triggerSOS(payload);

    expect(result.status).toBe("queued");
    expect(result.message).toBe("SOS request stored locally — waiting for connection");

    const queuedItems = await getAll<SyncQueueItem>(STORES.syncQueue);
    expect(queuedItems).toHaveLength(1);
    expect(queuedItems[0].action).toBe("SOS_CREATE");
  });
});
