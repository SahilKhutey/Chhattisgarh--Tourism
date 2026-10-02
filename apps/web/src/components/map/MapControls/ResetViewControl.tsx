"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export interface ResetViewControlProps {
  onResetView: () => void;
  className?: string;
}

export function ResetViewControl({ onResetView, className = "" }: ResetViewControlProps) {
  return (
    <button
      type="button"
      onClick={onResetView}
      aria-label="Reset map view to Chhattisgarh state"
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/95 text-foreground shadow-md backdrop-blur-md hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900/95 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      <RotateCcw className="h-4 w-4 text-forest-emerald" />
    </button>
  );
}
