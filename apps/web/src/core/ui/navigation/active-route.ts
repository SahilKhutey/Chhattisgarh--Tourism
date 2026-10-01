/**
 * Normalizes a pathname or href by stripping query strings, hashes, and trailing slashes.
 */
export function normalizePath(path: string): string {
  if (!path) return "/";
  // Remove hash and query params
  const cleanPath = path.split("#")[0].split("?")[0];
  // Remove trailing slash unless it is root
  if (cleanPath.length > 1 && cleanPath.endsWith("/")) {
    return cleanPath.slice(0, -1);
  }
  return cleanPath;
}

/**
 * Checks if the current pathname matches the target navigation href.
 *
 * @param currentPathname The pathname of current active route (e.g. from usePathname()).
 * @param targetHref The target link href.
 * @param exact Whether the match must be exact (defaults to true for "/" and false for other routes).
 */
export function isRouteActive(
  currentPathname: string,
  targetHref: string,
  exact?: boolean
): boolean {
  const normCurrent = normalizePath(currentPathname);
  const normTarget = normalizePath(targetHref);

  // Root route requires exact match by default unless explicitly specified otherwise
  if (normTarget === "/") {
    return normCurrent === "/";
  }

  if (exact) {
    return normCurrent === normTarget;
  }

  // Active if exact match or nested child route
  return (
    normCurrent === normTarget || normCurrent.startsWith(normTarget + "/")
  );
}
