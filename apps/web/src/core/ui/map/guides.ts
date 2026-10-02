import type { GeoCoordinate } from "./viewport";
import { isValidCoordinate } from "./viewport";

export interface MapGuideStep {
  id: string;
  title: string;
  description?: string;
  coordinate?: GeoCoordinate;
  entityId?: string;
  order: number;
  durationMinutes?: number;
}

export interface MapGuide {
  id: string;
  title: string;
  description?: string;
  steps: MapGuideStep[];
  estimatedDurationMinutes?: number;
  category?: string;
  routeId?: string;
}

export function sortGuideSteps(steps: MapGuideStep[]): MapGuideStep[] {
  return [...steps].sort((a, b) => a.order - b.order);
}

export function isValidGuide(guide: MapGuide): boolean {
  if (!guide || !guide.id || !guide.title || !Array.isArray(guide.steps)) {
    return false;
  }
  return guide.steps.length > 0;
}

export function getGuideCoordinates(guide: MapGuide): GeoCoordinate[] {
  return guide.steps
    .map((step) => step.coordinate)
    .filter((c): c is GeoCoordinate => !!c && isValidCoordinate(c));
}
