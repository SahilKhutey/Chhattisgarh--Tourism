export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeoValidationResult {
  placeId: string;
  name: string;
  valid: boolean;
  errors: string[];
  coordinates: Coordinates;
  insideStateBounds: boolean;
}

export interface HierarchyValidationReport {
  totalPlaces: number;
  validPlaces: number;
  invalidPlaces: number;
  details: GeoValidationResult[];
}
