"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";
import { isRouteActive } from "@/core/ui/navigation/active-route";
import { defaultBottomNavigationItems } from "@/core/ui/shell/navigation";
import type { BottomNavigationItem } from "@/core/ui/shell/types";

export interface BottomNavigationProps {
  items?: BottomNavigationItem[];
  className?: string;
}

export function BottomNavigation({
  items = defaultBottomNavigationItems,
  className,
}: BottomNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className={cn(
        "cg-bottom-navigation fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md md:hidden",
        className,
      )}
    >
      <div className="grid grid-cols-5">
        {items.map((item) => {
          const active = isRouteActive(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "cg-interactive flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-xs transition-colors",
                active
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="truncate max-w-[64px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
