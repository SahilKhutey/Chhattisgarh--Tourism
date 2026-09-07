import { getAll, put, remove, STORES } from "./db";
import type { SyncActionType, SyncQueueItem } from "./types";

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${Date.now()}-${crypto.randomUUID()}`;
  }
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

export async function enqueue(
  action: SyncActionType,
  payload: Record<string, unknown>
): Promise<SyncQueueItem> {
  const item: SyncQueueItem = {
    id: createId(),
    action,
    payload,
    createdAt: new Date().toISOString(),
    attempts: 0,
    status: "pending",
  };

  await put(STORES.syncQueue, item);
  return item;
}

export async function getPendingQueue(): Promise<SyncQueueItem[]> {
  const items = await getAll<SyncQueueItem>(STORES.syncQueue);

  return items
    .filter((item) => item.status === "pending" || item.status === "failed")
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function updateQueueItem(item: SyncQueueItem): Promise<void> {
  await put(STORES.syncQueue, item);
}

export async function removeQueueItem(id: string): Promise<void> {
  await remove(STORES.syncQueue, id);
}
