export type MapMode =
  | "overview"
  | "explore"
  | "details"
  | "route"
  | "guide"
  | "navigation"
  | "observer";

export type MapInteractionMode =
  | "browse"
  | "select"
  | "inspect"
  | "navigate";

export interface MapModeState {
  mode: MapMode;
  interaction: MapInteractionMode;
}

export type MapUIState =
  | {
      type: "idle";
    }
  | {
      type: "selected";
      entityId: string;
    }
  | {
      type: "details";
      entityId: string;
    }
  | {
      type: "guide";
      guideId: string;
      stepId?: string;
    }
  | {
      type: "route";
      routeId: string;
    };

export const SCALE_ZOOM_THRESHOLDS = {
  WORLD_STATE: 6,
  DIVISION: 7,
  DISTRICT: 8,
  TOURISM_ZONE: 9,
  DESTINATION: 10,
  EXPERIENCE: 12,
  SERVICE: 14,
  DETAIL: 16,
} as const;

export type MapLayerType =
  | "base"
  | "boundary"
  | "tourism"
  | "route"
  | "service"
  | "safety";

export interface MapLayer {
  id: string;
  label: string;
  type: MapLayerType;
  enabled: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export interface MapLayerState {
  enabledLayers: string[];
  baseLayer: "standard" | "terrain" | "satellite";
}

export const DEFAULT_MAP_LAYERS: MapLayer[] = [
  {
    id: "tourism-destinations",
    label: "Destinations",
    type: "tourism",
    enabled: true,
    minZoom: SCALE_ZOOM_THRESHOLDS.DISTRICT,
  },
  {
    id: "tourism-experiences",
    label: "Experiences",
    type: "tourism",
    enabled: true,
    minZoom: SCALE_ZOOM_THRESHOLDS.TOURISM_ZONE,
  },
  {
    id: "tourism-routes",
    label: "Routes",
    type: "route",
    enabled: true,
    minZoom: SCALE_ZOOM_THRESHOLDS.DISTRICT,
  },
  {
    id: "services-facilities",
    label: "Services & Food",
    type: "service",
    enabled: false,
    minZoom: SCALE_ZOOM_THRESHOLDS.SERVICE,
  },
  {
    id: "safety-emergency",
    label: "Safety & SOS",
    type: "safety",
    enabled: false,
    minZoom: SCALE_ZOOM_THRESHOLDS.TOURISM_ZONE,
  },
  {
    id: "boundaries-districts",
    label: "Districts & Zones",
    type: "boundary",
    enabled: true,
    minZoom: SCALE_ZOOM_THRESHOLDS.WORLD_STATE,
    maxZoom: SCALE_ZOOM_THRESHOLDS.DESTINATION,
  },
];
