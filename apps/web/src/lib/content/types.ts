export * from '../../types/content';

export interface GeoPointValue {
  lat: number;
  lng: number;
}

export interface ReviewEntryPayload {
  approved: boolean;
  note?: string;
}

export interface BoundingBoxQuery {
  north: number;
  south: number;
  east: number;
  west: number;
}
