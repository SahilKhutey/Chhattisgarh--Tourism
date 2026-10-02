"use client";

import React from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

export interface NotFoundStateProps {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
}

export function NotFoundState({
  title = "Destination or page not found",
  description = "The requested location, route, or guide could not be located. It may have moved or been updated.",
  actionHref = "/discover",
  actionLabel = "Explore Destinations",
  className = "",
}: NotFoundStateProps) {
  return (
    <div
      role="region"
      aria-label="Content not found notice"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-neutral-200/80 bg-white p-8 text-center sm:p-12 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-emerald/10 text-forest-emerald dark:bg-emerald-950/60 dark:text-emerald-400">
        <Compass className="h-6 w-6" />
      </div>

      <h2 className="text-base font-bold text-foreground sm:text-lg">
        {title}
      </h2>

      <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm leading-relaxed">
        {description}
      </p>

      {actionHref && (
        <div className="mt-6">
          <Link
            href={actionHref}
            className="inline-flex items-center justify-center rounded-xl bg-forest-emerald px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-forest-emerald/90 transition-colors"
          >
            {actionLabel}
          </Link>
        </div>
      )}
    </div>
  );
}
