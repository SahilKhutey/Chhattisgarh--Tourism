import type { ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  className?: string;
}

export function Breadcrumbs({
  items,
  separator,
  className = "",
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  const defaultSeparator = (
    <svg
      className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  );

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center overflow-x-auto py-2 text-sm", className)}
    >
      <ol className="flex items-center gap-1.5 sm:gap-2 list-none p-0 m-0">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5 sm:gap-2">
              {index > 0 && (
                <span className="select-none" aria-hidden="true">
                  {separator || defaultSeparator}
                </span>
              )}

              {isLast || !item.href ? (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "truncate max-w-[200px] sm:max-w-xs font-semibold",
                    isLast ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate max-w-[150px] sm:max-w-xs text-muted-foreground hover:text-foreground transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
