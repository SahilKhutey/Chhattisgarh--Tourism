"use client";

import React, { useState } from "react";
import { Compass, ChevronDown, ChevronUp, MapPin, Sparkles, Navigation, Layers } from "lucide-react";
import type { MapEntity } from "@/core/ui/map/entities";

export interface MapOverviewProps {
  entities: MapEntity[];
  regionName?: string;
  zoom?: number;
  routesCount?: number;
  guidesCount?: number;
  className?: string;
}

export function MapOverview({
  entities,
  regionName = "Chhattisgarh State",
  zoom,
  routesCount = 0,
  guidesCount = 0,
  className = "",
}: MapOverviewProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const destinationsCount = entities.filter((e) => e.type === "place").length;
  const experiencesCount = entities.filter((e) => e.type === "experience" || e.type === "event").length;
  const calculatedRoutesCount = routesCount || entities.filter((e) => e.type === "route").length;

  return (
    <aside
      aria-label="Geographic observer overview"
      className={`rounded-2xl border border-neutral-200/80 bg-white/95 p-3.5 shadow-lg backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/95 transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest-emerald/10 text-forest-emerald dark:bg-emerald-950 dark:text-emerald-400">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-forest-emerald dark:text-emerald-400">
                Observer Console
              </span>
              {typeof zoom === "number" && (
                <span className="text-[10px] font-mono text-muted-foreground">
                  Z{zoom.toFixed(1)}
                </span>
              )}
            </div>
            <h3 className="text-xs font-bold text-foreground truncate max-w-[160px]">
              {regionName}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? "Expand overview" : "Collapse overview"}
          className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors"
        >
          {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
        </button>
      </div>

      {!isCollapsed && (
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
          <MetricBadge
            icon={<MapPin className="h-3.5 w-3.5 text-forest-emerald" />}
            label="Places"
            value={destinationsCount}
          />
          <MetricBadge
            icon={<Sparkles className="h-3.5 w-3.5 text-teal-600" />}
            label="Experiences"
            value={experiencesCount}
          />
          <MetricBadge
            icon={<Navigation className="h-3.5 w-3.5 text-tribal-terracotta" />}
            label="Corridors"
            value={calculatedRoutesCount}
          />
        </div>
      )}
    </aside>
  );
}

function MetricBadge({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-neutral-50 px-2 py-1.5 text-center dark:bg-neutral-800/60">
      <div className="flex items-center gap-1 text-xs font-bold text-foreground">
        {icon}
        <span>{value}</span>
      </div>
      <span className="text-[10px] font-medium text-muted-foreground truncate w-full">
        {label}
      </span>
    </div>
  );
}
