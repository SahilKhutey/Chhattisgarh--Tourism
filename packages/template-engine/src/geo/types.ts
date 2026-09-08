/**
 * @cg-tourism/template-engine - First-Class Geographic Contracts
 * Regional Geographic capabilities for CG Tourism OS (Unseen36Garh)
 */

export interface GeoPointValue {
  lat: number;
  lng: number;
  altitudeM?: number;
}

export interface GeoPolygonCoordinates {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface GeoMultiPolygonCoordinates {
  type: 'MultiPolygon';
  coordinates: number[][][][];
}

export type GeoRegionValue = GeoPolygonCoordinates | GeoMultiPolygonCoordinates;

export interface AdministrativeRegionValue {
  country?: string; // Default "India"
  state: string; // e.g., "Chhattisgarh"
  division?: string; // e.g., "Bastar", "Surguja", "Bilaspur", "Raipur", "Durg"
  district: string; // e.g., "Bastar", "Dantewada", "Bilaspur"
  block?: string;
  tehsil?: string;
  locality?: string;
}

export interface GeoRouteWaypoint {
  name?: string;
  point: GeoPointValue;
  order: number;
}

export interface GeoRouteValue {
  geometry: string; // Encoded polyline or GeoJSON LineString
  distanceKm: number;
  durationMinutes: number;
  waypoints?: GeoRouteWaypoint[];
  elevationGainM?: number;
}
