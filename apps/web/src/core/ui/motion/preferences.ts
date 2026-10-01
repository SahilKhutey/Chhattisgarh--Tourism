"use client";

import { useEffect, useState } from "react";

/**
 * Returns true if reduced motion is requested, false otherwise.
 * Safe for use in SSR and browser environments.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * React hook to reactively track user's prefers-reduced-motion media query.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  return reduced;
}
