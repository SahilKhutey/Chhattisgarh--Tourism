"use client";

import { useState } from "react";
import { Skeleton } from "@/components/feedback/Skeleton";
import { cn } from "@/lib/ui/cn";

export interface ImageSkeletonProps {
  src?: string;
  alt?: string;
  aspectRatio?: "16/9" | "16/10" | "4/3" | "1/1" | "21/9";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  onLoad?: () => void;
}

const aspectRatioStyles: Record<NonNullable<ImageSkeletonProps["aspectRatio"]>, string> = {
  "16/9": "aspect-[16/9]",
  "16/10": "aspect-[16/10]",
  "4/3": "aspect-[4/3]",
  "1/1": "aspect-[1/1]",
  "21/9": "aspect-[21/9]",
};

export function ImageSkeleton({
  src,
  alt = "Tourism image",
  aspectRatio = "16/10",
  className,
  imageClassName,
  onLoad,
}: ImageSkeletonProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30 rounded-lg",
        aspectRatioStyles[aspectRatio],
        className,
      )}
    >
      {/* Reserved space skeleton placeholder while loading */}
      {!isLoaded && (
        <Skeleton
          className="absolute inset-0 h-full w-full rounded-none"
          aria-hidden="true"
        />
      )}

      {src && (
        <img
          src={src}
          alt={alt}
          onLoad={handleImageLoad}
          className={cn(
            "h-full w-full object-cover",
            isLoaded ? "cg-image-loaded" : "cg-image-loading",
            imageClassName,
          )}
        />
      )}
    </div>
  );
}
