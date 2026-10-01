export const motionDuration = {
  instant: "0ms",
  micro: "100ms",
  fast: "150ms",
  normal: "200ms",
  moderate: "300ms",
  slow: "450ms",
  reveal: "600ms",
} as const;

export const motionEase = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  entrance: "cubic-bezier(0, 0, 0.2, 1)",
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  emphasized: "cubic-bezier(0.2, 0.8, 0.2, 1)",
} as const;

export const motionDistance = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
} as const;

export const motionScale = {
  press: 0.98,
  subtle: 1.02,
} as const;
