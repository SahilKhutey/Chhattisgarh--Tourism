/**
 * CG Tourism OS — Spacing & Layout Tokens
 * Built on a strict 4px grid rhythm to ensure mathematical visual harmony.
 */

export const SPACING = {
  0: '0px',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem',    // 96px
  32: '8rem',    // 128px
} as const;

export const SPACING_PX = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const CONTAINERS = {
  sm: '640px',   // Mobile card containers
  md: '768px',   // Article / Reading flow
  lg: '1024px',  // Two-column layout
  xl: '1280px',  // Standard desktop viewport
  '2xl': '1536px', // Full panoramic GIS canvas
} as const;

export const TOUCH_TARGETS = {
  min: '44px',     // WCAG 2.1 AA minimum
  comfortable: '48px', // High-stress field operation
  generous: '56px',    // Emergency SOS button touch box
} as const;
