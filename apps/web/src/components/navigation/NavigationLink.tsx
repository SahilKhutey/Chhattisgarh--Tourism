"use client";

import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/ui/cn";
import { isRouteActive } from "@/core/ui/navigation/active-route";

export interface NavigationLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "href"> {
  href: string;
  children: ReactNode;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
}

export function NavigationLink({
  href,
  children,
  exact,
  className = "",
  activeClassName = "text-primary font-semibold bg-primary/10",
  inactiveClassName = "text-muted-foreground hover:text-foreground hover:bg-muted/50",
  ...props
}: NavigationLinkProps) {
  const pathname = usePathname() || "/";
  const isActive = isRouteActive(pathname, href, exact);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "cg-interactive inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isActive ? activeClassName : inactiveClassName,
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
