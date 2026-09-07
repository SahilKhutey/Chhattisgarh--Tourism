import { enqueue, getPendingQueue, removeQueueItem, updateQueueItem } from "./queue";
import type { SyncActionType, SyncQueueItem } from "./types";

function getApiBase(): string {
  const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export async function sendAction(item: SyncQueueItem): Promise<void> {
  const apiBase = getApiBase();
  let endpoint: string;
  let method = "POST";

  switch (item.action) {
    case "BOOKMARK_CREATE":
      endpoint = "/api/v1/bookmarks";
      break;

    case "BOOKMARK_DELETE":
      endpoint = `/api/v1/bookmarks/${String(item.payload.placeId)}`;
      method = "DELETE";
      break;

    case "SOS_CREATE":
      endpoint = "/api/v1/emergency/sos";
      break;

    case "ITINERARY_UPDATE":
      endpoint = `/api/v1/itineraries/${String(item.payload.id || item.payload.district || "")}`;
      method = "PATCH";
      break;

    default:
      throw new Error(`Unsupported sync action: ${item.action}`);
  }

  const response = await fetch(`${apiBase}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: method === "DELETE" ? undefined : JSON.stringify(item.payload),
  });

  if (!response.ok) {
    throw new Error(`Sync failed with HTTP ${response.status}`);
  }
}

export async function syncOfflineQueue(): Promise<{
  synced: number;
  failed: number;
}> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return {
      synced: 0,
      failed: 0,
    };
  }

  const queue = await getPendingQueue();
  let synced = 0;
  let failed = 0;

  for (const item of queue) {
    try {
      await updateQueueItem({
        ...item,
        status: "processing",
      });

      await sendAction(item);
      await removeQueueItem(item.id);
      synced += 1;
    } catch (error) {
      failed += 1;
      const attempts = item.attempts + 1;

      await updateQueueItem({
        ...item,
        status: "failed",
        attempts,
        lastError: error instanceof Error ? error.message : "Unknown synchronization error",
      });
    }
  }

  return {
    synced,
    failed,
  };
}

export async function queueAction(
  action: SyncActionType,
  payload: Record<string, unknown>
): Promise<SyncQueueItem> {
  const item = await enqueue(action, payload);
  await requestBackgroundSync();
  return item;
}

export async function requestBackgroundSync(): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    if ("sync" in registration) {
      await (registration as unknown as { sync: { register(tag: string): Promise<void> } }).sync.register("cg-tourism-sync");
    }
  } catch (err) {
    console.debug("Background sync registration bypassed or unsupported", err);
  }
}
