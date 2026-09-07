import { apiClient } from "./client";
import type {
  Category,
  PaginatedResponse,
  Place,
  PlaceSearchParams,
} from "./types";

export function normalizePlace(raw: any): Place {
  if (!raw) return raw;

  const districtObj =
    typeof raw.district === "object" && raw.district !== null
      ? raw.district
      : {
          id: typeof raw.district === "string" ? raw.district.toLowerCase() : "unknown",
          name: typeof raw.district === "string" ? raw.district : "Chhattisgarh",
          slug: typeof raw.district === "string" ? raw.district.toLowerCase() : "chhattisgarh",
        };

  const image =
    raw.imageUrl ||
    raw.heroImage ||
    (raw.media && raw.media.length > 0 ? raw.media[0].url : null) ||
    null;

  let calculatedRating: number | null = null;
  if (typeof raw.rating === "number") {
    calculatedRating = raw.rating;
  } else if (Array.isArray(raw.reviews) && raw.reviews.length > 0) {
    const sum = raw.reviews.reduce((acc: number, r: any) => acc + (r.rating || 0), 0);
    calculatedRating = Number((sum / raw.reviews.length).toFixed(1));
  } else {
    calculatedRating = 4.8;
  }

  return {
    id: raw.id || raw.slug,
    slug: raw.slug,
    name: raw.name,
    description: raw.description || null,
    latitude: typeof raw.latitude === "number" ? raw.latitude : 0,
    longitude: typeof raw.longitude === "number" ? raw.longitude : 0,
    district: districtObj,
    category: raw.category
      ? {
          id: raw.category.id || raw.category.slug || "general",
          name: raw.category.name || "Attraction",
          slug: raw.category.slug || "attraction",
        }
      : null,
    imageUrl: image,
    heroImage: raw.heroImage || image,
    verified: Boolean(raw.verified ?? (raw.verificationLevel === "VERIFIED" || raw.contentStatus === "APPROVED")),
    verificationLevel: raw.verificationLevel || (raw.verified ? "VERIFIED" : "UNVERIFIED"),
    rating: calculatedRating,
    reviewCount: Array.isArray(raw.reviews) ? raw.reviews.length : (raw.reviewCount ?? 0),
    durationMinutes: raw.durationMinutes ?? 90,
    bestSeason: raw.bestSeason || null,
    history: raw.history || null,
    safetyInfo: raw.safetyInfo || null,
    rules: raw.rules || null,
    audioUrl: raw.audioUrl || null,
    audioNarrator: raw.audioNarrator || null,
    highlights: Array.isArray(raw.highlights)
      ? raw.highlights
      : typeof raw.highlights === "string"
      ? JSON.parse(raw.highlights || "[]")
      : [],
    experienceTypes: Array.isArray(raw.experienceTypes)
      ? raw.experienceTypes
      : typeof raw.experienceTypes === "string"
      ? JSON.parse(raw.experienceTypes || "[]")
      : [],
    platformFeatures: Array.isArray(raw.platformFeatures)
      ? raw.platformFeatures
      : typeof raw.platformFeatures === "string"
      ? JSON.parse(raw.platformFeatures || "[]")
      : [],
    media: Array.isArray(raw.media) ? raw.media : [],
    weather: raw.weather,
    transport: raw.transport,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function buildQuery(params: PlaceSearchParams = {}): string {
  const query = new URLSearchParams();

  if (params.page !== undefined) {
    query.set("page", String(params.page));
  }
  if (params.limit !== undefined) {
    query.set("limit", String(params.limit));
  }
  if (params.search && params.search.trim()) {
    query.set("search", params.search.trim());
  }
  if (params.district && params.district !== "All") {
    query.set("district", params.district);
  }
  if (params.category && params.category !== "all") {
    query.set("category", params.category);
  }
  if (params.verified !== undefined) {
    query.set("verified", String(params.verified));
  }

  const value = query.toString();
  return value ? `?${value}` : "";
}

export async function getPlaces(
  params?: PlaceSearchParams,
): Promise<PaginatedResponse<Place>> {
  const rawResponse = await apiClient.get<any>(
    `/api/v1/places${buildQuery(params)}`,
  );

  if (Array.isArray(rawResponse)) {
    const places = rawResponse.map(normalizePlace);
    return {
      data: places,
      page: params?.page ?? 1,
      limit: params?.limit ?? places.length,
      total: places.length,
      totalPages: 1,
    };
  }

  if (rawResponse && Array.isArray(rawResponse.data)) {
    return {
      ...rawResponse,
      data: rawResponse.data.map(normalizePlace),
    };
  }

  return {
    data: [],
    page: 1,
    limit: 24,
    total: 0,
    totalPages: 0,
  };
}

export async function getPlace(slug: string): Promise<Place> {
  const raw = await apiClient.get<any>(
    `/api/v1/places/${encodeURIComponent(slug)}`,
  );
  return normalizePlace(raw);
}

export async function getNearbyPlaces(
  lat: number,
  lng: number,
  radiusKm = 50,
): Promise<Place[]> {
  const raw = await apiClient.get<any[]>(
    `/api/v1/places/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`,
  );
  return Array.isArray(raw) ? raw.map(normalizePlace) : [];
}

export async function getCategories(): Promise<Category[]> {
  const raw = await apiClient.get<Category[]>("/api/v1/places/categories");
  return Array.isArray(raw) ? raw : [];
}
