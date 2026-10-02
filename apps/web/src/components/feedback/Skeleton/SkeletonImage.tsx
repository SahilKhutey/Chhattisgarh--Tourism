import React from "react";
import { Image as ImageIcon } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/ui/cn";

export interface SkeletonImageProps {
  aspectRatio?: "16/9" | "4/3" | "1/1" | "21/9";
  className?: string;
}

export function SkeletonImage({
  aspectRatio = "16/9",
  className = "",
}: SkeletonImageProps) {
  const aspectClass = {
    "16/9": "aspect-video",
    "4/3": "aspect-[4/3]",
    "1/1": "aspect-square",
    "21/9": "aspect-[21/9]",
  }[aspectRatio];

  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-neutral-100 dark:bg-neutral-800/80",
        aspectClass,
        className,
      )}
      aria-hidden="true"
    >
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
      <ImageIcon className="relative z-10 h-8 w-8 text-neutral-400/60 dark:text-neutral-600" />
    </div>
  );
}
