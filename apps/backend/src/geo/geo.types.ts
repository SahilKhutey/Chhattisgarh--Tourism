export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BoundingBox {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface NearbyPlace {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  distanceMeters: number;
  district?: string;
  category?: string;
  heroImage?: string;
  rating?: number;
}

export interface RoutePoint {
  latitude: number;
  longitude: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
}

export interface DivisionItem {
  id: string;
  name: string;
  slug: string;
  nameHi?: string | null;
  code: string;
  districtCount: number;
}

export interface DistrictItem {
  id: string;
  name: string;
  slug: string;
  nameHi?: string | null;
  code: string;
  divisionId: string;
  latitude?: number | null;
  longitude?: number | null;
  zoneCount: number;
  placeCount: number;
}

export interface TouristZoneItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  districtId: string;
  latitude?: number | null;
  longitude?: number | null;
  placeCount: number;
}
