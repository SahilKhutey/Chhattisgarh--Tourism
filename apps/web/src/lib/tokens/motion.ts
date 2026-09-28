/**
 * CG Tourism OS — Motion & Transition Tokens
 * Smooth, natural transitions with strict automatic suppression
 * under user-preferred reduced motion.
 */

export const DURATIONS = {
  instant: '50ms',
  fast: '150ms',     // Hover states, micro-interactions
  normal: '250ms',   // Dropdowns, tab switches, cards
  slow: '400ms',     // Drawer slide-ins, modal appearances
  scenic: '700ms',   // Map camera transitions, hero carousel fades
} as const;

export const EASINGS = {
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',      // Snappy and natural
  decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1.0)',  // Elements entering screen
  accelerate: 'cubic-bezier(0.4, 0.0, 1.0, 1.0)',  // Elements leaving screen
  organic: 'cubic-bezier(0.16, 1, 0.3, 1)',        // Fluid spring-like motion
} as const;

export const MOTION = {
  fadeFast: `opacity ${DURATIONS.fast} ${EASINGS.standard}`,
  fadeNormal: `opacity ${DURATIONS.normal} ${EASINGS.standard}`,
  transformNormal: `transform ${DURATIONS.normal} ${EASINGS.organic}`,
  allNormal: `all ${DURATIONS.normal} ${EASINGS.standard}`,
} as const;
