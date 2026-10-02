import type { GeoCoordinate } from "./viewport";
import type { MapEntity } from "./entities";
import type { MapRoute } from "./routes";

export interface MapDetailsAction {
  id: string;
  label: string;
  href?: string;
  action?: string;
  variant?: "primary" | "secondary" | "outline";
}

export interface MapDetailsModel {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category?: string;
  district?: string;
  summary?: string;
  coordinates: GeoCoordinate;
  actions: MapDetailsAction[];
  highlights?: string[];
  visitingInfo?: string;
  rating?: number;
  metadata?: Record<string, unknown>;
}

export function entityToDetails(entity: MapEntity): MapDetailsModel {
  const actions: MapDetailsAction[] = [];

  if (entity.href) {
    actions.push({
      id: "explore",
      label: "Explore Destination",
      href: entity.href,
      variant: "primary",
    });
  } else {
    actions.push({
      id: "explore",
      label: "Explore Details",
      href: `/destinations/${entity.id}`,
      variant: "primary",
    });
  }

  actions.push({
    id: "add-to-trip",
    label: "Add to Trip",
    action: "add-to-trip",
    variant: "secondary",
  });

  return {
    id: entity.id,
    title: entity.title,
    subtitle: entity.district ? `${entity.district} District` : entity.category,
    imageUrl: entity.imageUrl,
    category: entity.category || entity.type,
    district: entity.district,
    summary: entity.description || "Discover this remarkable destination in Chhattisgarh.",
    coordinates: {
      latitude: entity.latitude,
      longitude: entity.longitude,
    },
    actions,
  };
}

export function routeToDetails(route: MapRoute): MapDetailsModel {
  return {
    id: route.id,
    title: route.title,
    subtitle: `${route.stops?.length || 2} stops · ${route.difficulty || "Scenic"}`,
    summary: route.description || "A curated scenic corridor route across Chhattisgarh.",
    coordinates: route.coordinates[0],
    actions: [
      {
        id: "view-route",
        label: "View Corridor",
        href: `/corridors/${route.id}`,
        variant: "primary",
      },
      {
        id: "add-to-trip",
        label: "Add Route to Trip",
        action: "add-to-trip",
        variant: "secondary",
      },
    ],
    highlights: route.stops,
  };
}
