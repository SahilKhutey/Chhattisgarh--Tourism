import type { MapEntityType, MapEntity } from "./entities";
import type { GeoCoordinate } from "./viewport";

export interface MapMarkerModel {
  id: string;
  entityId: string;
  type: MapEntityType;
  latitude: number;
  longitude: number;
  label: string;
  category?: string;
  icon?: string;
  priority: number;
  interactive: boolean;
  district?: string;
  description?: string;
  imageUrl?: string;
}

export interface MarkerCluster {
  id: string;
  count: number;
  center: GeoCoordinate;
  entityIds: string[];
}

export type MarkerShape = "diamond" | "circle" | "ring" | "shield" | "star" | "flag";

export function getMarkerCategoryShape(type: MapEntityType): MarkerShape {
  switch (type) {
    case "place":
      return "diamond"; // ◆ Destination
    case "experience":
      return "circle"; // ● Activity
    case "event":
      return "star"; // ★ Festival / Event
    case "service":
      return "ring"; // ⊙ Service / Food / Stay
    case "safety":
      return "shield"; // ▣ Emergency / SOS
    case "guide":
      return "flag"; // ⚐ Curated Guide
    default:
      return "circle";
  }
}

export function getMarkerPriority(type: MapEntityType, explicitPriority?: number): number {
  if (typeof explicitPriority === "number") return explicitPriority;

  switch (type) {
    case "place":
      return 100;
    case "experience":
      return 80;
    case "event":
      return 70;
    case "guide":
      return 60;
    case "service":
      return 40;
    case "safety":
      return 90;
    default:
      return 30;
  }
}

export function entityToMarker(entity: MapEntity): MapMarkerModel {
  return {
    id: `marker-${entity.id}`,
    entityId: entity.id,
    type: entity.type,
    latitude: entity.latitude,
    longitude: entity.longitude,
    label: entity.title,
    category: entity.category,
    priority: getMarkerPriority(entity.type, entity.priority),
    interactive: true,
    district: entity.district,
    description: entity.description,
    imageUrl: entity.imageUrl,
  };
}
