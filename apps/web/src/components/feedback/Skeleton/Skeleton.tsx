import React from "react";
import { cn } from "@/lib/ui/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  label?: string;
}

export function Skeleton({
  className = "",
  "aria-hidden": ariaHidden = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(
        "animate-pulse rounded-md bg-neutral-200 dark:bg-neutral-800 cg-skeleton",
        className,
      )}
      {...props}
    />
  );
}
