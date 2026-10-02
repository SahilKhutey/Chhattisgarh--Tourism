"use client";

import React, { useState } from "react";
import { Locate, Loader2 } from "lucide-react";
import type { GeoCoordinate } from "@/core/ui/map/viewport";

export interface LocateControlProps {
  onLocate: (coord: GeoCoordinate) => void;
  className?: string;
}

export function LocateControl({ onLocate, className = "" }: LocateControlProps) {
  const [isLocating, setIsLocating] = useState(false);

  function handleLocate() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        onLocate({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000, enableHighAccuracy: true },
    );
  }

  return (
    <button
      type="button"
      onClick={handleLocate}
      disabled={isLocating}
      aria-label="Locate my position on map"
      className={`flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/95 text-foreground shadow-md backdrop-blur-md hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900/95 dark:hover:bg-neutral-800 transition-colors ${className}`}
    >
      {isLocating ? (
        <Loader2 className="h-4 w-4 animate-spin text-forest-emerald" />
      ) : (
        <Locate className="h-4 w-4 text-forest-emerald" />
      )}
    </button>
  );
}
