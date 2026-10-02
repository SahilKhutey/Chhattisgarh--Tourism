import React from "react";
import { Skeleton } from "./Skeleton";
import { SkeletonText } from "./SkeletonText";
import { cn } from "@/lib/ui/cn";

export interface SkeletonCardProps {
  className?: string;
  hasImage?: boolean;
}

export function SkeletonCard({
  className = "",
  hasImage = true,
}: SkeletonCardProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900",
        className,
      )}
    >
      {hasImage && (
        <Skeleton className="mb-3.5 h-44 w-full rounded-xl" />
      )}
      <div className="mb-2 flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-3 w-16 rounded" />
      </div>
      <Skeleton className="mb-2.5 h-5 w-3/4 rounded" />
      <SkeletonText lines={2} className="mb-4" />
      <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-20 rounded-xl" />
      </div>
    </div>
  );
}
