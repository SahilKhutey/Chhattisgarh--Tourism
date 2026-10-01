export type GeoCoordinate = {
  latitude: number;
  longitude: number;
};

export type GeoBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type GeoEntityType =
  | "division"
  | "district"
  | "zone"
  | "place"
  | "route"
  | "experience"
  | "service"
  | "safety";

export type GeoEntityReference = {
  id: string;
  type: GeoEntityType;
  name: string;
  coordinate?: GeoCoordinate;
};

export type GeoMapViewport = {
  center: GeoCoordinate;
  zoom: number;
};
