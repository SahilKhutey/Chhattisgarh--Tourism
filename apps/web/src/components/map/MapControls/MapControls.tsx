"use client";

import React from "react";
import type { GeoCoordinate } from "@/core/ui/map/viewport";
import { ZoomControls } from "./ZoomControls";
import { LocateControl } from "./LocateControl";
import { ResetViewControl } from "./ResetViewControl";
import { FullscreenControl } from "./FullscreenControl";

export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onLocate: (coord: GeoCoordinate) => void;
  onResetView: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  className?: string;
}

export function MapControls({
  onZoomIn,
  onZoomOut,
  onLocate,
  onResetView,
  isFullscreen = false,
  onToggleFullscreen,
  className = "",
}: MapControlsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Map observer controls"
      className={`flex flex-col gap-2 ${className}`}
    >
      <ZoomControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} />
      <LocateControl onLocate={onLocate} />
      <ResetViewControl onResetView={onResetView} />
      {onToggleFullscreen && (
        <FullscreenControl
          isFullscreen={isFullscreen}
          onToggleFullscreen={onToggleFullscreen}
        />
      )}
    </div>
  );
}
