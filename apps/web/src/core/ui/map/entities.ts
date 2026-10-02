import type { MapRoute } from "./routes";
import type { MapGuide } from "./guides";
import type { MapViewport } from "./viewport";
import { SCALE_ZOOM_THRESHOLDS } from "./types";

export type MapEntityType =
  | "division"
  | "district"
  | "zone"
  | "place"
  | "route"
  | "experience"
  | "service"
  | "safety"
  | "guide"
  | "event";

export interface MapEntity {
  id: string;
  type: MapEntityType;
  title: string;
  latitude: number;
  longitude: number;
  description?: string;
  category?: string;
  district?: string;
  zone?: string;
  href?: string;
  imageUrl?: string;
  priority?: number;
  visible?: boolean;
  metadata?: Record<string, unknown>;
}

export interface MapQueryResult {
  entities: MapEntity[];
  routes?: MapRoute[];
  guides?: MapGuide[];
  viewport?: MapViewport;
}

export function sortEntitiesByPriority(entities: MapEntity[]): MapEntity[] {
  return [...entities].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function filterEntitiesByZoom(entities: MapEntity[], zoom: number): MapEntity[] {
  return entities.filter((entity) => {
    if (entity.visible === false) return false;

    switch (entity.type) {
      case "division":
        return zoom >= SCALE_ZOOM_THRESHOLDS.WORLD_STATE && zoom <= SCALE_ZOOM_THRESHOLDS.DISTRICT;
      case "district":
        return zoom >= SCALE_ZOOM_THRESHOLDS.DIVISION && zoom <= SCALE_ZOOM_THRESHOLDS.DESTINATION;
      case "zone":
        return zoom >= SCALE_ZOOM_THRESHOLDS.DISTRICT && zoom <= SCALE_ZOOM_THRESHOLDS.EXPERIENCE;
      case "place":
        return zoom >= SCALE_ZOOM_THRESHOLDS.DISTRICT;
      case "route":
        return zoom >= SCALE_ZOOM_THRESHOLDS.DISTRICT;
      case "experience":
      case "event":
        return zoom >= SCALE_ZOOM_THRESHOLDS.TOURISM_ZONE;
      case "service":
      case "safety":
        return zoom >= SCALE_ZOOM_THRESHOLDS.SERVICE;
      case "guide":
        return zoom >= SCALE_ZOOM_THRESHOLDS.DESTINATION;
      default:
        return true;
    }
  });
}

export function filterEntitiesByLayers(entities: MapEntity[], enabledLayers: string[]): MapEntity[] {
  const allowDestinations = enabledLayers.includes("tourism-destinations");
  const allowExperiences = enabledLayers.includes("tourism-experiences");
  const allowRoutes = enabledLayers.includes("tourism-routes");
  const allowServices = enabledLayers.includes("services-facilities");
  const allowSafety = enabledLayers.includes("safety-emergency");
  const allowBoundaries = enabledLayers.includes("boundaries-districts");

  return entities.filter((entity) => {
    switch (entity.type) {
      case "place":
        return allowDestinations;
      case "experience":
      case "event":
      case "guide":
        return allowExperiences;
      case "route":
        return allowRoutes;
      case "service":
        return allowServices;
      case "safety":
        return allowSafety;
      case "division":
      case "district":
      case "zone":
        return allowBoundaries;
      default:
        return true;
    }
  });
}
