export const UI_BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
} as const;

export const UI_Z_INDEX = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  toast: 1400,
  maximum: 1500,
} as const;

export const UI_DURATIONS = {
  instant: 0,
  fast: 150,
  normal: 200,
  slow: 300,
} as const;
