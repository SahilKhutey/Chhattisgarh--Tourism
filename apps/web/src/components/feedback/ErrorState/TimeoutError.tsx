"use client";

import React from "react";
import Link from "next/link";
import { Clock } from "lucide-react";
import { ErrorState } from "./ErrorState";
import { Button } from "@/components/ui/Button";

export interface TimeoutErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  continueHref?: string;
  continueLabel?: string;
  className?: string;
}

export function TimeoutError({
  title = "This is taking longer than expected",
  description = "The connection took too long to respond. The network may be slow or congested.",
  onRetry,
  continueHref = "/discover",
  continueLabel = "Continue Browsing",
  className = "",
}: TimeoutErrorProps) {
  return (
    <ErrorState
      title={title}
      description={description}
      onRetry={onRetry}
      retryLabel="Try Again"
      icon={<Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />}
      action={
        continueHref ? (
          <Link
            href={continueHref}
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-foreground shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            {continueLabel}
          </Link>
        ) : undefined
      }
      className={className}
    />
  );
}
