import type { GeoCoordinate } from "./viewport";
import { isValidCoordinate } from "./viewport";

export interface MapRoute {
  id: string;
  title: string;
  coordinates: GeoCoordinate[];
  distanceMeters?: number;
  durationMinutes?: number;
  difficulty?: "easy" | "moderate" | "challenging" | string;
  stops?: string[];
  color?: string;
  description?: string;
}

export function isValidRoute(route: MapRoute): boolean {
  if (!route || !route.id || !route.title || !Array.isArray(route.coordinates)) {
    return false;
  }
  if (route.coordinates.length < 2) {
    return false;
  }
  return route.coordinates.every(isValidCoordinate);
}

// Haversine distance calculation in meters
export function calculateRouteDistance(coordinates: GeoCoordinate[]): number {
  if (coordinates.length < 2) return 0;

  const R = 6371e3; // Earth radius in meters
  let totalDistance = 0;

  for (let i = 0; i < coordinates.length - 1; i++) {
    const c1 = coordinates[i];
    const c2 = coordinates[i + 1];

    if (!isValidCoordinate(c1) || !isValidCoordinate(c2)) continue;

    const lat1 = (c1.latitude * Math.PI) / 180;
    const lat2 = (c2.latitude * Math.PI) / 180;
    const deltaLat = ((c2.latitude - c1.latitude) * Math.PI) / 180;
    const deltaLon = ((c2.longitude - c1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    totalDistance += R * c;
  }

  return Math.round(totalDistance);
}
