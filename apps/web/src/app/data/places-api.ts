import { fetchPlaces, fetchPlaceBySlug as fetchSharedPlaceBySlug, type Destination } from "./api";
import { getApiBase } from "./api-config";

const API_BASE_URL = getApiBase();

export async function fetchAllPlaces(categorySlug?: string, district?: string): Promise<Destination[]> {
  return fetchPlaces(categorySlug, district);
}

export async function fetchPlaceBySlug(slug: string): Promise<Destination> {
  const place = await fetchSharedPlaceBySlug(slug);
  if (!place) {
    throw new Error(`Destination with slug '${slug}' not found.`);
  }

  return place;
}

export async function fetchNearbyPlaces(lat: number, lng: number, radiusKm: number = 50): Promise<Record<string, unknown>[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/places/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.warn("Backend API unavailable for nearby places.", error);
    return [];
  }
}
