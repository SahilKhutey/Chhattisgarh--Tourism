import React from "react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/ui/cn";

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineClassName?: string;
}

export function SkeletonText({
  lines = 3,
  className = "",
  lineClassName = "",
}: SkeletonTextProps) {
  const widths = ["w-full", "w-11/12", "w-4/5", "w-3/4", "w-1/2"];

  return (
    <div className={cn("space-y-2", className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-3.5",
            widths[i % widths.length],
            lineClassName,
          )}
        />
      ))}
    </div>
  );
}
