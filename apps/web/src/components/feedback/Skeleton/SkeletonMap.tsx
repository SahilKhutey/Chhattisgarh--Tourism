import React from "react";
import { Compass } from "lucide-react";
import { Skeleton } from "./Skeleton";
import { cn } from "@/lib/ui/cn";

export interface SkeletonMapProps {
  className?: string;
}

export function SkeletonMap({ className = "h-80 w-full" }: SkeletonMapProps) {
  return (
    <div
      role="status"
      aria-label="Loading map and spatial coordinates..."
      aria-busy="true"
      className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/80 bg-sand-beige/40 dark:border-neutral-800 dark:bg-neutral-900/50",
        className,
      )}
    >
      <Skeleton className="absolute inset-0 h-full w-full rounded-none opacity-40" />

      {/* Stylized Observer Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

      <div className="relative z-10 flex flex-col items-center gap-2 text-center p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest-emerald/10 text-forest-emerald dark:bg-emerald-950/60 dark:text-emerald-400">
          <Compass className="h-6 w-6 animate-spin text-forest-emerald [animation-duration:4s]" />
        </div>
        <span className="text-xs font-mono font-bold tracking-wider uppercase text-forest-emerald dark:text-emerald-400">
          Loading Geographic Intelligence...
        </span>
      </div>
    </div>
  );
}
