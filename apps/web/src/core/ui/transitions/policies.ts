import type { TransitionType, TransitionDuration, TransitionStyleConfig } from "./types";

/**
 * Canonical Transition Policy
 * Strictly aligned with supported TransitionType variants.
 */
export const transitionPolicy = {
  route: {
    type: "fade" as TransitionType,
    duration: "fast" as TransitionDuration,
  },
  content: {
    type: "slide-up" as TransitionType,
    duration: "normal" as TransitionDuration,
  },
  modal: {
    type: "scale" as TransitionType,
    duration: "fast" as TransitionDuration,
  },
  navigation: {
    type: "slide-down" as TransitionType,
    duration: "fast" as TransitionDuration,
  },
} as const;

export const transitionDurationMs: Record<TransitionDuration, number> = {
  fast: 180,
  normal: 240,
  moderate: 360,
};

/**
 * Returns CSS animation class and duration for a given transition type
 */
export function getTransitionConfig(
  type: TransitionType = "fade",
  duration: TransitionDuration = "normal",
): TransitionStyleConfig {
  const durationMs = transitionDurationMs[duration];

  switch (type) {
    case "fade":
      return { animationClass: "cg-transition-fade", durationMs };
    case "slide-up":
      return { animationClass: "cg-transition-slide-up", durationMs };
    case "slide-down":
      return { animationClass: "cg-transition-slide-down", durationMs };
    case "scale":
      return { animationClass: "cg-transition-scale", durationMs };
    case "crossfade":
      return { animationClass: "cg-transition-crossfade", durationMs };
    case "none":
    default:
      return { animationClass: "", durationMs: 0 };
  }
}
