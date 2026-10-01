/**
 * Shell Responsive & Safe Area Utilities
 */

export const SHELL_BREAKPOINTS = {
  mobileMax: 767,
  tabletMin: 768,
  desktopMin: 1024,
  wideMin: 1280,
} as const;

/**
 * Returns safe area padding CSS variables or styles for mobile devices
 */
export function getSafeAreaStyles() {
  return {
    paddingBottom: "env(safe-area-inset-bottom, 0px)",
    paddingTop: "env(safe-area-inset-top, 0px)",
  };
}
