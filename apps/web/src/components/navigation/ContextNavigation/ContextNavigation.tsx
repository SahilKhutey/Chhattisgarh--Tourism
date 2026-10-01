"use client";

import type { ContextNavigationItem } from "@/core/ui/shell/types";
import { cn } from "@/lib/ui/cn";

export interface ContextNavigationProps {
  title?: string;
  items: ContextNavigationItem[];
  activeAnchor?: string;
  className?: string;
}

export function ContextNavigation({
  title,
  items,
  activeAnchor,
  className,
}: ContextNavigationProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav
      aria-label={title || "Section navigation"}
      className={cn(
        "sticky top-16 z-30 flex items-center gap-2 overflow-x-auto border-b bg-background/90 px-4 py-2.5 backdrop-blur-xs text-sm scrollbar-none",
        className,
      )}
    >
      {title && (
        <span className="font-semibold text-foreground text-xs uppercase tracking-wider shrink-0 pr-2 border-r">
          {title}
        </span>
      )}
      <ul className="flex items-center gap-1.5 list-none p-0 m-0 shrink-0">
        {items.map((item) => {
          const isActive = activeAnchor ? activeAnchor === item.anchor || activeAnchor === item.href : false;

          return (
            <li key={item.id}>
              <a
                href={item.anchor || item.href}
                className={cn(
                  "cg-interactive inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
