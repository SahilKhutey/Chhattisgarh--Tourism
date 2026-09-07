import { get, getAll, put, remove, STORES } from "./db";
import type { OfflineItinerary } from "./types";

export async function saveOfflineItinerary(itinerary: OfflineItinerary): Promise<void> {
  await put(STORES.itineraries, {
    ...itinerary,
    cachedAt: new Date().toISOString(),
  });
}

export async function getOfflineItinerary(id: string): Promise<OfflineItinerary | undefined> {
  return get<OfflineItinerary>(STORES.itineraries, id);
}

export async function getOfflineItineraries(): Promise<OfflineItinerary[]> {
  return getAll<OfflineItinerary>(STORES.itineraries);
}

export async function deleteOfflineItinerary(id: string): Promise<void> {
  await remove(STORES.itineraries, id);
}
