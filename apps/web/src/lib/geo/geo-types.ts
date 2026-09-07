export interface MapPlace {
  id: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  distanceMeters?: number;
  district?: string;
  category?: string;
  heroImage?: string;
  rating?: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoDivision {
  id: string;
  name: string;
  slug: string;
  nameHi?: string | null;
  code: string;
  districtCount?: number;
}

export interface GeoDistrict {
  id: string;
  name: string;
  slug: string;
  nameHi?: string | null;
  code: string;
  divisionId: string;
  latitude?: number | null;
  longitude?: number | null;
  zoneCount?: number;
  placeCount?: number;
}

export interface TouristZone {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  districtId: string;
  latitude?: number | null;
  longitude?: number | null;
  placeCount?: number;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  geometry: [number, number][];
}

export interface MapState {
  center: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
  selectedPlaceId: string | null;
  selectedDistrictId: string | null;
  selectedZoneId: string | null;
  visibleBounds: MapBounds | null;
  isOffline: boolean;
  isLoading: boolean;
}
