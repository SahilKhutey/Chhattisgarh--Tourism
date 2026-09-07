import { get, getAll, put, STORES } from "./db";
import type { OfflinePlace, OfflineDestination } from "./types";

export async function cachePlace(place: OfflinePlace): Promise<void> {
  await put(STORES.places, {
    ...place,
    cachedAt: new Date().toISOString(),
  });
}

export async function cachePlaces(places: OfflinePlace[]): Promise<void> {
  await Promise.all(places.map(cachePlace));
}

export async function getCachedPlace(id: string): Promise<OfflinePlace | undefined> {
  return get<OfflinePlace>(STORES.places, id);
}

export async function getCachedPlaces(): Promise<OfflinePlace[]> {
  return getAll<OfflinePlace>(STORES.places);
}

export async function cacheDestination(destination: OfflineDestination): Promise<void> {
  await put(STORES.destinations, {
    ...destination,
    cachedAt: new Date().toISOString(),
  });
}

export async function getCachedDestination(id: string): Promise<OfflineDestination | undefined> {
  return get<OfflineDestination>(STORES.destinations, id);
}

export async function getCachedDestinations(): Promise<OfflineDestination[]> {
  return getAll<OfflineDestination>(STORES.destinations);
}
