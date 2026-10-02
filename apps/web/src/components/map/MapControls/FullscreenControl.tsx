"use client";

import React from "react";
import { Maximize2, Minimize2 } from "lucide-react";

export interface FullscreenControlProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  className?: string;
}

export function FullscreenControl({
  isFullscreen,
  onToggleFullscreen,
  className = "",
}: FullscreenControlProps) {
  return (
    <button
      type="button"
      onClick={onToggleFullscreen}
      aria-label={isFullscreen ? "Exit fullscreen observer map" : "Enter fullscreen observer map"}
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/95 text-foreground shadow-md backdrop-blur-md hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/95 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      {isFullscreen ? (
        <Minimize2 className="h-4 w-4 text-forest-emerald" />
      ) : (
        <Maximize2 className="h-4 w-4 text-forest-emerald" />
      )}
    </button>
  );
}
