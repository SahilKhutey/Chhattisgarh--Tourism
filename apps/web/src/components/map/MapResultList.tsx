"use client";

import React from "react";
import { MapPin, Sparkles, Navigation, ArrowRight } from "lucide-react";
import type { MapEntity } from "@/core/ui/map/entities";

export interface MapResultListProps {
  entities: MapEntity[];
  selectedEntityId?: string | null;
  onSelectEntity: (entity: MapEntity) => void;
  onInspectEntity?: (entity: MapEntity) => void;
  className?: string;
}

export function MapResultList({
  entities,
  selectedEntityId,
  onSelectEntity,
  onInspectEntity,
  className = "",
}: MapResultListProps) {
  return (
    <div
      role="region"
      aria-label="Map destination and experience listings"
      className={`flex flex-col bg-white dark:bg-neutral-900 ${className}`}
    >
      <div className="flex items-center justify-between border-b border-neutral-100 px-4 py-2.5 dark:border-neutral-800">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Entities in View ({entities.length})
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800" role="list">
        {entities.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No entities available in this area or filter.
          </div>
        ) : (
          entities.map((entity) => {
            const isSelected = selectedEntityId === entity.id;

            return (
              <div
                key={entity.id}
                role="listitem"
                className={`flex items-center justify-between gap-3 p-3 transition-colors ${
                  isSelected
                    ? "bg-forest-emerald/10 dark:bg-emerald-950/40"
                    : "hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectEntity(entity)}
                  className="flex-1 min-w-0 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-forest-emerald rounded-lg"
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-emerald dark:text-emerald-400">
                      {entity.category || entity.type}
                    </span>
                    {entity.district && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        · {entity.district}
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {entity.title}
                  </h4>
                  {entity.description && (
                    <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {entity.description}
                    </p>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectEntity(entity);
                    if (onInspectEntity) onInspectEntity(entity);
                  }}
                  aria-label={`Inspect ${entity.title}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-forest-emerald hover:text-white dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-forest-emerald transition-colors"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
