import type { ShellNavigationGroup, BottomNavigationItem } from "./types";

/**
 * Consumer Information Architecture Configuration
 * Represents consumer intent rather than internal database schemas.
 */
export const consumerNavigation: ShellNavigationGroup[] = [
  {
    id: "discover",
    label: "Discover",
    items: [
      {
        id: "destinations",
        label: "Destinations",
        href: "/discover",
        priority: "primary",
        audience: "consumer",
      },
      {
        id: "experiences",
        label: "Experiences",
        href: "/experiences",
        priority: "primary",
        audience: "consumer",
      },
      {
        id: "explore",
        label: "Corridors & Explore",
        href: "/explore",
        priority: "primary",
        audience: "consumer",
      },
      {
        id: "map",
        label: "Interactive Map",
        href: "/map",
        priority: "secondary",
        audience: "consumer",
      },
    ],
  },
  {
    id: "plan",
    label: "Plan",
    items: [
      {
        id: "trip-planner",
        label: "Plan a Trip",
        href: "/planner",
        priority: "primary",
        audience: "consumer",
      },
      {
        id: "saved",
        label: "Saved Trips & Places",
        href: "/bookmarks",
        priority: "secondary",
        audience: "consumer",
        requiresAuth: true,
      },
      {
        id: "safety",
        label: "Emergency & Safety",
        href: "/sos",
        priority: "secondary",
        audience: "consumer",
      },
    ],
  },
  {
    id: "community",
    label: "Community",
    items: [
      {
        id: "stories",
        label: "Local Stories & Folklore",
        href: "/stories",
        priority: "primary",
        audience: "consumer",
      },
      {
        id: "creators",
        label: "Creators & Guides",
        href: "/creators",
        priority: "secondary",
        audience: "consumer",
      },
      {
        id: "partner",
        label: "Become a Partner",
        href: "/partner",
        priority: "secondary",
        audience: "consumer",
      },
    ],
  },
];

/**
 * High-frequency mobile bottom navigation configuration (max 5 items)
 */
export const defaultBottomNavigationItems: BottomNavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: "home",
  },
  {
    id: "discover",
    label: "Discover",
    href: "/discover",
    icon: "compass",
  },
  {
    id: "plan",
    label: "Plan",
    href: "/planner",
    icon: "map-pin",
  },
  {
    id: "saved",
    label: "Saved",
    href: "/bookmarks",
    icon: "bookmark",
  },
  {
    id: "account",
    label: "Account",
    href: "/login",
    icon: "user",
  },
];
