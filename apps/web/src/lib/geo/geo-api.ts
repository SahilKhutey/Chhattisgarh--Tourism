import type {
  GeoDistrict,
  GeoDivision,
  MapBounds,
  MapPlace,
  RouteResult,
  TouristZone,
} from "./geo-types";

function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000";
  return value.replace(/\/api\/v1\/?$/, "").replace(/\/+$/, "");
}

async function request<T>(path: string): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/v1${path}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    throw new Error(`Geo API request failed with status ${response.status} for ${path}`);
  }

  return response.json();
}

export async function getNearbyPlaces(
  latitude: number,
  longitude: number,
  radiusMeters = 50_000,
  limit = 100,
): Promise<MapPlace[]> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    radiusMeters: String(radiusMeters),
    limit: String(limit),
  });

  try {
    const data = await request<MapPlace[]>(`/geo/nearby?${params}`);
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem("cg_cached_nearby_places", JSON.stringify(data));
      } catch {}
    }
    return data;
  } catch (error) {
    // Offline / Network error fallback to cached places if available
    if (typeof window !== "undefined" && window.localStorage) {
      const cached = localStorage.getItem("cg_cached_nearby_places");
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    throw error;
  }
}

export async function getPlacesInBounds(
  bounds: MapBounds,
  limit = 200,
): Promise<MapPlace[]> {
  const params = new URLSearchParams({
    north: String(bounds.north),
    south: String(bounds.south),
    east: String(bounds.east),
    west: String(bounds.west),
    limit: String(limit),
  });

  return request<MapPlace[]>(`/geo/bounds?${params}`);
}

export async function getRoute(
  originLat: number,
  originLng: number,
  destLat: number,
  destLng: number,
): Promise<RouteResult> {
  const params = new URLSearchParams({
    originLat: String(originLat),
    originLng: String(originLng),
    destLat: String(destLat),
    destLng: String(destLng),
  });

  return request<RouteResult>(`/geo/route?${params}`);
}

export async function getDivisions(): Promise<GeoDivision[]> {
  return request<GeoDivision[]>("/geo/divisions");
}

export async function getDistricts(divisionId?: string): Promise<GeoDistrict[]> {
  const query = divisionId ? `?divisionId=${encodeURIComponent(divisionId)}` : "";
  return request<GeoDistrict[]>(`/geo/districts${query}`);
}

export async function getDistrict(idOrSlug: string): Promise<GeoDistrict> {
  return request<GeoDistrict>(`/geo/districts/${encodeURIComponent(idOrSlug)}`);
}

export async function getZones(districtId: string): Promise<TouristZone[]> {
  return request<TouristZone[]>(`/geo/districts/${encodeURIComponent(districtId)}/zones`);
}

export async function getZonePlaces(zoneId: string): Promise<MapPlace[]> {
  return request<MapPlace[]>(`/geo/zones/${encodeURIComponent(zoneId)}/places`);
}
