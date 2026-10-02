"use client";

import React from "react";
import type { MapLayer } from "@/core/ui/map/types";

export interface LayerListProps {
  layers: MapLayer[];
  enabledLayers: string[];
  onToggleLayer: (layerId: string) => void;
  className?: string;
}

export function LayerList({
  layers,
  enabledLayers,
  onToggleLayer,
  className = "",
}: LayerListProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1">
        Geographic Layers
      </span>
      <div className="space-y-1">
        {layers.map((layer) => {
          const isEnabled = enabledLayers.includes(layer.id);
          const inputId = `layer-toggle-${layer.id}`;

          return (
            <label
              key={layer.id}
              htmlFor={inputId}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer select-none transition-colors"
            >
              <span>{layer.label}</span>
              <input
                id={inputId}
                type="checkbox"
                checked={isEnabled}
                onChange={() => onToggleLayer(layer.id)}
                className="h-4 w-4 rounded border-neutral-300 text-forest-emerald focus:ring-forest-emerald dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          );
        })}
      </div>
    </div>
  );
}
