import { InteractionState } from "./types";

export interface ComponentInteractionConfig {
  hover: string;
  press: string;
  focus: string;
  loading: string;
  success: string;
}

export const interactionMatrix: Record<string, ComponentInteractionConfig> = {
  button: {
    hover: "opacity/elevation",
    press: "scale(0.98)",
    focus: "focus-ring",
    loading: "spinner",
    success: "state-change",
  },
  iconButton: {
    hover: "subtle-background",
    press: "scale(0.98)",
    focus: "focus-ring",
    loading: "spinner",
    success: "icon-change",
  },
  link: {
    hover: "underline/color",
    press: "none",
    focus: "focus-ring",
    loading: "none",
    success: "none",
  },
  card: {
    hover: "translateY(-2px)",
    press: "translateY(0)",
    focus: "focus-ring",
    loading: "skeleton",
    success: "none",
  },
  navItem: {
    hover: "background",
    press: "none",
    focus: "focus-ring",
    loading: "none",
    success: "active",
  },
  mapMarker: {
    hover: "scale(1.05)",
    press: "scale(0.95)",
    focus: "focus-ring",
    loading: "none",
    success: "selected",
  },
  input: {
    hover: "border-highlight",
    press: "none",
    focus: "focus-ring",
    loading: "spinner",
    success: "validation",
  },
  toast: {
    hover: "none",
    press: "dismiss",
    focus: "focus-ring",
    loading: "none",
    success: "none",
  },
};

const validStates: Set<InteractionState> = new Set([
  "idle",
  "hover",
  "press",
  "focus",
  "loading",
  "success",
  "error",
]);

export function isValidInteractionState(state: string): state is InteractionState {
  return validStates.has(state as InteractionState);
}
