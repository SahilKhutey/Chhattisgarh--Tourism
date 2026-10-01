"use client";

import { NavigationItem } from "@/core/ui/navigation/types";
import { consumerNavigation } from "@/core/ui/navigation/navigation";
import { NavigationLink } from "./NavigationLink";
import { cn } from "@/lib/ui/cn";

export interface DesktopNavigationProps {
  items?: NavigationItem[];
  className?: string;
}

const defaultPrimaryItems: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", exact: true },
  { id: "destinations", label: "Destinations", href: "/destinations" },
  { id: "explore", label: "Explore", href: "/explore" },
  { id: "map", label: "Map", href: "/map" },
  { id: "planner", label: "Trip Planner", href: "/planner" },
  { id: "stories", label: "Stories", href: "/stories" },
  { id: "creators", label: "Creators", href: "/creators" },
];

export function DesktopNavigation({
  items = defaultPrimaryItems,
  className = "",
}: DesktopNavigationProps) {
  return (
    <nav
      aria-label="Desktop Navigation"
      className={cn("hidden md:flex items-center space-x-1 lg:space-x-2", className)}
    >
      <ul className="flex items-center space-x-1 lg:space-x-2 list-none m-0 p-0">
        {items.map((item) => (
          <li key={item.id}>
            <NavigationLink
              href={item.href}
              exact={item.exact}
              className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            >
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
