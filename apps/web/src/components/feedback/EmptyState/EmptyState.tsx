"use client";

import React from "react";
import Link from "next/link";
import { SearchX, FilterX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

export interface EmptyStateProps {
  title?: string;
  description: string;
  onClearFilters?: () => void;
  clearLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title = "No results found",
  description,
  onClearFilters,
  clearLabel = "Clear Filters",
  actionHref,
  actionLabel = "Explore All",
  action,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/50 p-8 text-center sm:p-12 dark:border-neutral-800 dark:bg-neutral-900/40",
        className,
      )}
    >
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
        {icon || <SearchX className="h-6 w-6" />}
      </div>

      <h3 className="text-base font-bold text-foreground sm:text-lg">
        {title}
      </h3>

      <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm leading-relaxed">
        {description}
      </p>

      {(onClearFilters || actionHref || action) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onClearFilters && (
            <Button
              variant="outline"
              size="md"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5"
            >
              <FilterX className="h-4 w-4" />
              <span>{clearLabel}</span>
            </Button>
          )}
          {actionHref && (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center rounded-xl bg-forest-emerald px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-forest-emerald/90 transition-colors"
            >
              {actionLabel}
            </Link>
          )}
          {action}
        </div>
      )}
    </div>
  );
}
