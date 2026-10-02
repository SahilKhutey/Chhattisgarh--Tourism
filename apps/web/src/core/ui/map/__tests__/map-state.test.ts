import type { MapUIState } from "../types";
import {
  transitionMapState,
  isEntitySelected,
  isDetailsOpen,
  getActiveEntityId,
  getActiveGuide,
  getActiveRouteId,
} from "../state";

describe("Map UI State Machine", () => {
  it("transitions from idle to selected entity", () => {
    const initial: MapUIState = { type: "idle" };
    const next = transitionMapState(initial, { type: "SELECT_ENTITY", entityId: "place-1" });

    expect(next.type).toBe("selected");
    if (next.type === "selected") {
      expect(next.entityId).toBe("place-1");
    }
    expect(isEntitySelected(next, "place-1")).toBe(true);
    expect(isEntitySelected(next, "place-2")).toBe(false);
    expect(getActiveEntityId(next)).toBe("place-1");
  });

  it("transitions from selected to details panel", () => {
    const initial: MapUIState = { type: "selected", entityId: "place-1" };
    const next = transitionMapState(initial, { type: "OPEN_DETAILS", entityId: "place-1" });

    expect(next.type).toBe("details");
    expect(isDetailsOpen(next)).toBe(true);
    expect(getActiveEntityId(next)).toBe("place-1");
  });

  it("closes details back to selected entity", () => {
    const initial: MapUIState = { type: "details", entityId: "place-1" };
    const next = transitionMapState(initial, { type: "CLOSE_DETAILS" });

    expect(next.type).toBe("selected");
    if (next.type === "selected") {
      expect(next.entityId).toBe("place-1");
    }
  });

  it("transitions to guide mode and handles step selection", () => {
    const initial: MapUIState = { type: "idle" };
    const guideState = transitionMapState(initial, {
      type: "START_GUIDE",
      guideId: "guide-1",
      stepId: "step-1",
    });

    expect(guideState.type).toBe("guide");
    expect(getActiveGuide(guideState)).toEqual({ guideId: "guide-1", stepId: "step-1" });

    const nextStep = transitionMapState(guideState, {
      type: "SELECT_STEP",
      guideId: "guide-1",
      stepId: "step-2",
    });
    expect(getActiveGuide(nextStep)).toEqual({ guideId: "guide-1", stepId: "step-2" });
  });

  it("transitions to route selection", () => {
    const initial: MapUIState = { type: "idle" };
    const routeState = transitionMapState(initial, {
      type: "SELECT_ROUTE",
      routeId: "corridor-bastar",
    });

    expect(routeState.type).toBe("route");
    expect(getActiveRouteId(routeState)).toBe("corridor-bastar");
  });

  it("resets state to idle", () => {
    const initial: MapUIState = { type: "details", entityId: "place-1" };
    const reset = transitionMapState(initial, { type: "RESET" });
    expect(reset.type).toBe("idle");
  });
});
