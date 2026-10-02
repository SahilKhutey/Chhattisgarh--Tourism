"use client";

import React, { useState, useRef, useEffect } from "react";
import { Layers, X } from "lucide-react";
import type { MapLayer } from "@/core/ui/map/types";
import { DEFAULT_MAP_LAYERS } from "@/core/ui/map/types";
import { LayerList } from "./LayerList";
import { LayerLegend } from "./LayerLegend";

export interface LayerControlProps {
  layers?: MapLayer[];
  enabledLayers: string[];
  baseLayer: "standard" | "terrain" | "satellite";
  onToggleLayer: (layerId: string) => void;
  onSelectBaseLayer: (base: "standard" | "terrain" | "satellite") => void;
  className?: string;
}

export function LayerControl({
  layers = DEFAULT_MAP_LAYERS,
  enabledLayers,
  baseLayer,
  onToggleLayer,
  onSelectBaseLayer,
  className = "",
}: LayerControlProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Map layers and basemap selector"
        aria-expanded={isOpen}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200/80 bg-white/95 text-foreground shadow-md backdrop-blur-md transition-all hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-emerald dark:border-neutral-800 dark:bg-neutral-900/95 dark:hover:bg-neutral-800"
      >
        <Layers className="h-5 w-5 text-forest-emerald" />
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Map layers settings"
          className="absolute right-0 top-12 z-[1000] w-72 rounded-2xl border border-neutral-200/90 bg-white/98 p-4 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/98 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="mb-3 flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <span className="text-xs font-bold text-foreground uppercase tracking-wider">
              Map Configuration
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close layers panel"
              className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Base Layer Switcher */}
          <div className="mb-4">
            <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Basemap Style
            </span>
            <div className="grid grid-cols-3 gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
              {(["standard", "terrain", "satellite"] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onSelectBaseLayer(mode)}
                  className={`rounded-lg py-1.5 text-xs font-semibold capitalize transition-all ${
                    baseLayer === mode
                      ? "bg-white text-forest-emerald shadow-xs dark:bg-neutral-900 dark:text-emerald-400"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Thematic Layers */}
          <div className="mb-4">
            <LayerList
              layers={layers}
              enabledLayers={enabledLayers}
              onToggleLayer={onToggleLayer}
            />
          </div>

          {/* Map Symbology Legend */}
          <LayerLegend compact={true} />
        </div>
      )}
    </div>
  );
}
