/**
 * CG Tourism OS — Border Radius Tokens
 * Balanced between organic soft curves (reflecting natural landforms)
 * and crisp architectural precision.
 */

export const RADII = {
  none: '0px',
  sm: '4px',       // Micro-tags, table badges
  md: '8px',       // Standard buttons, form inputs, tooltips
  lg: '12px',      // Cards, popup callouts, dialogs
  xl: '16px',      // Featured hero banners, floating drawers
  '2xl': '24px',   // Bottom dock container, prominent media containers
  full: '9999px',  // Pill badges, circular avatar badges, floating action buttons (FAB)
} as const;

export type RadiusToken = keyof typeof RADII;
