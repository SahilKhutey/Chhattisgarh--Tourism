export type MotionDuration =
  | "instant"
  | "micro"
  | "fast"
  | "normal"
  | "moderate"
  | "slow"
  | "reveal";

export type MotionDirection = "up" | "down" | "left" | "right";

export type MotionIntensity = "none" | "subtle" | "standard" | "emphasized";

export type InteractionState =
  | "idle"
  | "hover"
  | "press"
  | "focus"
  | "loading"
  | "success"
  | "error";

export interface MotionOptions {
  duration?: MotionDuration;
  intensity?: MotionIntensity;
  direction?: MotionDirection;
  disabled?: boolean;
}
