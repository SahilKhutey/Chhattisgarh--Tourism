import type { MapUIState } from "./types";

export type MapAction =
  | { type: "SELECT_ENTITY"; entityId: string }
  | { type: "OPEN_DETAILS"; entityId: string }
  | { type: "CLOSE_DETAILS" }
  | { type: "START_GUIDE"; guideId: string; stepId?: string }
  | { type: "SELECT_STEP"; guideId: string; stepId: string }
  | { type: "SELECT_ROUTE"; routeId: string }
  | { type: "RESET" };

export function transitionMapState(current: MapUIState, action: MapAction): MapUIState {
  switch (action.type) {
    case "SELECT_ENTITY":
      return {
        type: "selected",
        entityId: action.entityId,
      };

    case "OPEN_DETAILS":
      return {
        type: "details",
        entityId: action.entityId,
      };

    case "CLOSE_DETAILS":
      if (current.type === "details") {
        return {
          type: "selected",
          entityId: current.entityId,
        };
      }
      return current;

    case "START_GUIDE":
      return {
        type: "guide",
        guideId: action.guideId,
        stepId: action.stepId,
      };

    case "SELECT_STEP":
      return {
        type: "guide",
        guideId: action.guideId,
        stepId: action.stepId,
      };

    case "SELECT_ROUTE":
      return {
        type: "route",
        routeId: action.routeId,
      };

    case "RESET":
      return {
        type: "idle",
      };

    default:
      return current;
  }
}

export function isEntitySelected(state: MapUIState, entityId: string): boolean {
  if (state.type === "selected" || state.type === "details") {
    return state.entityId === entityId;
  }
  return false;
}

export function isDetailsOpen(state: MapUIState): boolean {
  return state.type === "details";
}

export function getActiveEntityId(state: MapUIState): string | null {
  if (state.type === "selected" || state.type === "details") {
    return state.entityId;
  }
  return null;
}

export function getActiveGuide(state: MapUIState): { guideId: string; stepId?: string } | null {
  if (state.type === "guide") {
    return { guideId: state.guideId, stepId: state.stepId };
  }
  return null;
}

export function getActiveRouteId(state: MapUIState): string | null {
  if (state.type === "route") {
    return state.routeId;
  }
  return null;
}
