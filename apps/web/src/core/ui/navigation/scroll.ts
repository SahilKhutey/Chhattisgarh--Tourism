export interface ScrollToElementOptions {
  offset?: number;
  behavior?: ScrollBehavior;
  focusElement?: boolean;
}

/**
 * Checks whether the user has requested reduced motion.
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Scrolls smoothly to a target element by ID, respecting prefers-reduced-motion.
 * Also manages focus for accessibility and screen readers.
 *
 * @param elementId ID of target DOM element
 * @param options Offset, behavior override, and focus management
 * @returns true if element was found and scroll initiated, false otherwise
 */
export function scrollToElement(
  elementId: string,
  options: ScrollToElementOptions = {}
): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const cleanId = elementId.startsWith("#") ? elementId.slice(1) : elementId;
  const target = document.getElementById(cleanId);
  if (!target) {
    return false;
  }

  const { offset = 80, behavior = "smooth", focusElement = true } = options;
  const prefersReduced = isReducedMotionPreferred();
  const effectiveBehavior: ScrollBehavior = prefersReduced ? "auto" : behavior;

  const targetRect = target.getBoundingClientRect();
  const targetTop = targetRect.top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: effectiveBehavior,
  });

  if (focusElement) {
    // Make target programmatically focusable if it is not already
    if (!target.hasAttribute("tabindex")) {
      target.setAttribute("tabindex", "-1");
    }
    try {
      target.focus({ preventScroll: true });
    } catch {
      target.focus();
    }
  }

  return true;
}
