/**
 * CG Tourism OS — Elevation & Shadow Tokens
 * Employs subtle warm organic ambient tints instead of cold artificial grays.
 */

export const ELEVATIONS = {
  none: 'none',
  // Low elevation: cards, interactive chips
  low: '0 1px 3px rgba(30, 34, 41, 0.08), 0 1px 2px rgba(30, 34, 41, 0.04)',
  // Medium elevation: hovering cards, dropdown menus, filter pills
  medium: '0 4px 12px rgba(30, 34, 41, 0.10), 0 2px 4px rgba(30, 34, 41, 0.06)',
  // High elevation: floating search bars, bottom docks, drawer panels
  high: '0 10px 25px rgba(30, 34, 41, 0.14), 0 4px 10px rgba(30, 34, 41, 0.08)',
  // Modal elevation: dialog overlays, emergency SOS confirm modal
  modal: '0 20px 40px rgba(10, 54, 34, 0.22), 0 8px 16px rgba(30, 34, 41, 0.12)',
  // Inner inset: active button press, search input wells
  inset: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
} as const;

export type ElevationToken = keyof typeof ELEVATIONS;
