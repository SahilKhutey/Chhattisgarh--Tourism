export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface GeoPolygon {
  type: "Polygon";
  coordinates: number[][][];
}

export interface MapRegionConfig {
  bounds?: GeoBounds;
  allowMultiplePolygons: boolean;
}

export function validateGeoPoint(point: GeoPoint): void {
  if (typeof point.latitude !== "number" || point.latitude < -90 || point.latitude > 90) {
    throw new Error("Latitude must be a number between -90 and 90");
  }
  if (typeof point.longitude !== "number" || point.longitude < -180 || point.longitude > 180) {
    throw new Error("Longitude must be a number between -180 and 180");
  }
}

export function validateGeoBounds(bounds: GeoBounds): void {
  if (bounds.north <= bounds.south) {
    throw new Error("North bound must be strictly greater than south bound");
  }
  if (bounds.east <= bounds.west) {
    throw new Error("East bound must be strictly greater than west bound");
  }
}
