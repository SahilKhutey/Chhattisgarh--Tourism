/**
 * CG Tourism OS — Responsive Breakpoints
 * Calibrated for everything from low-cost Android smartphones in remote Bastar
 * to dual-monitor desktop mapping command centers.
 */

export const BREAKPOINTS = {
  xs: 360,   // Ultra-compact mobile
  sm: 640,   // Standard mobile portrait
  md: 768,   // Tablets / Split-screen landscape
  lg: 1024,  // Small laptops / landscape tablets
  xl: 1280,  // Standard desktop
  '2xl': 1536, // Panoramic GIS / large monitors
} as const;

export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs}px)`,
  sm: `(min-width: ${BREAKPOINTS.sm}px)`,
  md: `(min-width: ${BREAKPOINTS.md}px)`,
  lg: `(min-width: ${BREAKPOINTS.lg}px)`,
  xl: `(min-width: ${BREAKPOINTS.xl}px)`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']}px)`,
  reducedMotion: '(prefers-reduced-motion: reduce)',
  highContrast: '(forced-colors: active)',
} as const;
