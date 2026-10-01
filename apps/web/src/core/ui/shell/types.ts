/**
 * Consumer Shell & Navigation Contracts for CG Tourism OS
 */

export type NavigationAudience =
  | "consumer"
  | "creator"
  | "admin";

export type NavigationPriority =
  | "primary"
  | "secondary"
  | "contextual";

export interface ShellNavigationItem {
  id: string;
  label: string;
  href: string;
  description?: string;
  priority: NavigationPriority;
  audience: NavigationAudience;
  requiresAuth?: boolean;
  external?: boolean;
  icon?: string;
}

export interface ShellNavigationGroup {
  id: string;
  label: string;
  items: ShellNavigationItem[];
}

/**
 * High-frequency bottom navigation item
 */
export interface BottomNavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badgeCount?: number;
}

/**
 * Consumer Shell View State (derived from underlying auth/data systems)
 */
export interface ConsumerShellState {
  authenticated: boolean;
  savedCount?: number;
  activeTripCount?: number;
  notificationCount?: number;
}

/**
 * Contextual Page-Level Navigation Contracts
 */
export interface ContextNavigationItem {
  id: string;
  label: string;
  href: string;
  anchor?: string;
}

export interface ContextNavigation {
  title?: string;
  items: ContextNavigationItem[];
}
