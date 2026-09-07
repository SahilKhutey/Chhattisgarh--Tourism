import "fake-indexeddb/auto";
import { clearStore, STORES } from "@/lib/offline/db";
import {
  enqueue,
  getPendingQueue,
  updateQueueItem,
  removeQueueItem,
} from "@/lib/offline/queue";

describe("Offline Action Sync Queue", () => {
  beforeEach(async () => {
    await clearStore(STORES.syncQueue);
  });

  test("enqueues actions and returns pending items in FIFO order", async () => {
    const item1 = await enqueue("BOOKMARK_CREATE", { placeId: "p1" });
    const item2 = await enqueue("SOS_CREATE", { latitude: 19.0, longitude: 82.0 });

    expect(item1.id).toBeDefined();
    expect(item1.status).toBe("pending");
    expect(item2.id).toBeDefined();

    const pending = await getPendingQueue();
    expect(pending).toHaveLength(2);
    expect(pending[0].id).toBe(item1.id);
    expect(pending[1].id).toBe(item2.id);
  });

  test("updates queue item status, attempts, and error message", async () => {
    const item = await enqueue("BOOKMARK_DELETE", { bookmarkId: "b-123" });

    await updateQueueItem({
      ...item,
      status: "processing",
      attempts: 1,
      lastError: "Server temporarily unreachable",
    });

    const pending = await getPendingQueue();
    expect(pending).toHaveLength(0); // Status is 'processing', not pending/failed
  });

  test("removes queue item successfully", async () => {
    const item = await enqueue("ITINERARY_UPDATE", { id: "it-1" });
    let pending = await getPendingQueue();
    expect(pending).toHaveLength(1);

    await removeQueueItem(item.id);
    pending = await getPendingQueue();
    expect(pending).toHaveLength(0);
  });
});
