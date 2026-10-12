'use client';

import { useState, useEffect } from 'react';

/**
 * Social Engine Phase 8 Motion & Animation Design Tokens
 * Follows calm, editorial, cinematic UX principles for regional tourism.
 */

export const SOCIAL_DURATIONS = {
  instant: 100, // micro-interactions, toggles
  fast: 160,    // badge, button state change
  normal: 220,  // card hover lift, dropdowns
  medium: 300,  // drawer open, filter expansions
  slow: 400,    // full page enter, modal reveal
} as const;

export const SOCIAL_EASINGS = {
  standard: 'cubic-bezier(0.2, 0, 0, 1)',
  decelerate: 'cubic-bezier(0, 0, 0.2, 1)',
  accelerate: 'cubic-bezier(0.4, 0, 1, 1)',
  spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
} as const;

export const SOCIAL_DEPTH = {
  level0: {
    blur: 'none',
    className: 'backdrop-blur-none',
  },
  level1: {
    blur: '8px',
    className: 'backdrop-blur-md bg-white/80 dark:bg-zinc-950/80 border-b border-zinc-200/60 dark:border-zinc-800/60',
  },
  level2: {
    blur: '16px',
    className: 'backdrop-blur-xl bg-black/80 text-white',
  },
} as const;

export const SOCIAL_Z_INDEX = {
  base: 0,
  cardOverlay: 10,
  sticky: 100,
  dropdown: 200,
  drawer: 300,
  modal: 400,
  toast: 500,
} as const;

/**
 * Hook to respect user's system preferences for reduced motion.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  return prefersReducedMotion;
}

/**
 * Returns a CSS transition property string based on tokens.
 */
export function getTransitionStyle(
  properties: string | string[] = 'all',
  duration: keyof typeof SOCIAL_DURATIONS = 'normal',
  easing: keyof typeof SOCIAL_EASINGS = 'standard'
): string {
  const dur = SOCIAL_DURATIONS[duration];
  const ease = SOCIAL_EASINGS[easing];
  const propList = Array.isArray(properties) ? properties : [properties];

  return propList.map((p) => `${p} ${dur}ms ${ease}`).join(', ');
}

/**
 * Calculate staggered entrance delay for list/grid items.
 */
export function getStaggerDelay(index: number, stepMs = 35, maxMs = 350): number {
  return Math.min(index * stepMs, maxMs);
}
