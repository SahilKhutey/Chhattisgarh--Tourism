import { NavigationGroup, NavigationItem } from "./types";

export const consumerNavigation: NavigationGroup[] = [
  {
    id: "discover",
    label: "Discover",
    items: [
      {
        id: "home",
        label: "Home",
        href: "/",
        exact: true,
        description: "Experience the real Chhattisgarh",
      },
      {
        id: "destinations",
        label: "Destinations",
        href: "/destinations",
        description: "Waterfalls, ancient temples, caves, and scenic reserves",
      },
      {
        id: "map",
        label: "Interactive Map",
        href: "/map",
        description: "Explore Chhattisgarh through interactive geospatial layers",
      },
    ],
  },
  {
    id: "explore",
    label: "Explore",
    items: [
      {
        id: "explore-all",
        label: "All Attractions",
        href: "/explore",
        description: "Search, filter, and discover all points of interest",
      },
      {
        id: "stories",
        label: "Stories & Folklore",
        href: "/stories",
        description: "Oral traditions, tribal legends, and local heritage",
      },
      {
        id: "creators",
        label: "Creator Spotlights",
        href: "/creators",
        description: "Authentic travel reels and visual stories from local creators",
      },
    ],
  },
  {
    id: "plan",
    label: "Plan & Travel",
    items: [
      {
        id: "planner",
        label: "Trip Planner",
        href: "/planner",
        description: "Intelligent multi-day circuit planning and itineraries",
      },
      {
        id: "districts",
        label: "Districts",
        href: "/districts",
        description: "Regional travel guides across all 33 districts",
      },
    ],
  },
  {
    id: "experience",
    label: "Experiences",
    items: [
      {
        id: "bookings",
        label: "Bookings",
        href: "/bookings",
        description: "Verified homestays, eco-camps, and local guides",
      },
      {
        id: "bookmarks",
        label: "Saved Places",
        href: "/bookmarks",
        description: "Your bookmarked destinations and travel notes",
      },
    ],
  },
  {
    id: "safety",
    label: "Safety & SOS",
    items: [
      {
        id: "safety-info",
        label: "Safety & SOS",
        href: "/safety",
        description: "Emergency contacts, local advisories, and offline safety toolkit",
      },
    ],
  },
];

/**
 * Returns a flat list of all navigation items across groups.
 */
export function getAllNavigationItems(): NavigationItem[] {
  return consumerNavigation.flatMap((group) => group.items);
}

/**
 * Finds a navigation group by its ID.
 */
export function getNavigationGroup(groupId: string): NavigationGroup | undefined {
  return consumerNavigation.find((group) => group.id === groupId);
}
