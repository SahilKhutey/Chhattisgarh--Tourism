"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { ShellNavigationItem } from "@/core/ui/shell/types";
import { isRouteActive } from "@/core/ui/navigation/active-route";
import { cn } from "@/lib/ui/cn";

export interface NavigationItemProps {
  item: ShellNavigationItem;
  className?: string;
  onClick?: () => void;
}

export function NavigationItem({
  item,
  className,
  onClick,
}: NavigationItemProps) {
  const pathname = usePathname();
  const active = isRouteActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "cg-interactive inline-flex items-center rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "font-medium text-foreground bg-accent/15 border-b-2 border-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-muted/40",
        className,
      )}
    >
      {item.label}
    </Link>
  );
}
