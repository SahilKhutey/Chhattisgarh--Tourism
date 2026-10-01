import { MotionDuration } from "./types";
import { motionDuration, motionEase } from "./tokens";

const durationMap: Record<MotionDuration, number> = {
  instant: 0,
  micro: 100,
  fast: 150,
  normal: 200,
  moderate: 300,
  slow: 450,
  reveal: 600,
};

/**
 * Converts a canonical motion duration token to milliseconds integer.
 */
export function getMotionDurationMs(duration: MotionDuration = "normal"): number {
  return durationMap[duration] ?? 200;
}

/**
 * Returns a CSS transition property string using canonical tokens.
 */
export function createTransition(
  properties: string[] = ["all"],
  duration: MotionDuration = "normal",
  ease: keyof typeof motionEase = "standard"
): string {
  const dur = motionDuration[duration] || motionDuration.normal;
  const timing = motionEase[ease] || motionEase.standard;
  return properties.map((prop) => `${prop} ${dur} ${timing}`).join(", ");
}
