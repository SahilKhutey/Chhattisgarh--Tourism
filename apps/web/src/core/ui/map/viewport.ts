import type { GeoCoordinate, GeoBounds } from "../geo/types";
import { isValidCoordinate, isValidBounds } from "../geo/validation";

export type { GeoCoordinate };

export interface MapViewport {
  center: GeoCoordinate;
  zoom: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export { isValidCoordinate, isValidBounds };

export const CHHATTISGARH_CENTER: GeoCoordinate = {
  latitude: 21.2514,
  longitude: 81.6296,
};

export const CHHATTISGARH_DEFAULT_ZOOM = 7;

export const CHHATTISGARH_BOUNDS: MapBounds = {
  north: 24.1,
  south: 17.7,
  east: 84.4,
  west: 80.2,
};

export const DEFAULT_VIEWPORT: MapViewport = {
  center: CHHATTISGARH_CENTER,
  zoom: CHHATTISGARH_DEFAULT_ZOOM,
};

export function isCoordinateInBounds(coord: GeoCoordinate, bounds: MapBounds): boolean {
  if (!isValidCoordinate(coord) || !isValidBounds(bounds)) return false;
  return (
    coord.latitude <= bounds.north &&
    coord.latitude >= bounds.south &&
    coord.longitude <= bounds.east &&
    coord.longitude >= bounds.west
  );
}

export function calculateCenter(coordinates: GeoCoordinate[]): GeoCoordinate {
  const valid = coordinates.filter(isValidCoordinate);
  if (valid.length === 0) return CHHATTISGARH_CENTER;

  const sumLat = valid.reduce((sum, c) => sum + c.latitude, 0);
  const sumLng = valid.reduce((sum, c) => sum + c.longitude, 0);

  return {
    latitude: Number((sumLat / valid.length).toFixed(6)),
    longitude: Number((sumLng / valid.length).toFixed(6)),
  };
}
