"use client";

import React from "react";
import { Plus, Minus } from "lucide-react";

export interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  canZoomIn?: boolean;
  canZoomOut?: boolean;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  canZoomIn = true,
  canZoomOut = true,
}: ZoomControlsProps) {
  return (
    <div
      role="group"
      aria-label="Map zoom controls"
      className="flex flex-col overflow-hidden rounded-xl border border-neutral-200/80 bg-white/95 shadow-md backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95"
    >
      <button
        type="button"
        onClick={onZoomIn}
        disabled={!canZoomIn}
        aria-label="Zoom in"
        className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none dark:hover:bg-neutral-800 transition-colors"
      >
        <Plus className="h-4 w-4" />
      </button>
      <div className="h-[1px] w-full bg-neutral-100 dark:bg-neutral-800" />
      <button
        type="button"
        onClick={onZoomOut}
        disabled={!canZoomOut}
        aria-label="Zoom out"
        className="flex h-9 w-9 items-center justify-center text-foreground hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none dark:hover:bg-neutral-800 transition-colors"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}
