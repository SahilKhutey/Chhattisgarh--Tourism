/**
 * Transition Types & Contracts for CG Tourism UI/UX
 * Continuity mechanisms ensuring seamless route and content state changes.
 */

export type TransitionType =
  | "none"
  | "fade"
  | "slide-up"
  | "slide-down"
  | "scale"
  | "crossfade";

export type TransitionDuration = "fast" | "normal" | "moderate";

export interface TransitionOptions {
  type?: TransitionType;
  duration?: TransitionDuration;
  reducedMotion?: boolean;
}

export interface TransitionStyleConfig {
  animationClass: string;
  durationMs: number;
}
