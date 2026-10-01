import type {
  GeoCoordinate,
  GeoBounds,
} from "./types";

export function isValidCoordinate(
  coordinate: GeoCoordinate,
): boolean {
  return (
    Number.isFinite(coordinate.latitude) &&
    Number.isFinite(coordinate.longitude) &&
    coordinate.latitude >= -90 &&
    coordinate.latitude <= 90 &&
    coordinate.longitude >= -180 &&
    coordinate.longitude <= 180
  );
}

export function isValidBounds(
  bounds: GeoBounds,
): boolean {
  return (
    Number.isFinite(bounds.north) &&
    Number.isFinite(bounds.south) &&
    Number.isFinite(bounds.east) &&
    Number.isFinite(bounds.west) &&
    bounds.north >= bounds.south
  );
}
