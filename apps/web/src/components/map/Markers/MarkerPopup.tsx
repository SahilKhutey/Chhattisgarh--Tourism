"use client";

import React from "react";
import { Popup } from "react-leaflet";
import type { MapEntity } from "@/core/ui/map/entities";

export interface MarkerPopupProps {
  entity: MapEntity;
  onInspect?: (entity: MapEntity) => void;
}

export function MarkerPopup({ entity, onInspect }: MarkerPopupProps) {
  return (
    <Popup className="cg-map-popup" closeButton={false}>
      <div className="p-2 min-w-[190px] max-w-[240px] text-left">
        {entity.imageUrl && (
          <div className="relative mb-2 h-24 w-full overflow-hidden rounded-lg bg-neutral-100">
            <img
              src={entity.imageUrl}
              alt={entity.title}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        <div className="mb-1 flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-forest-emerald bg-forest-emerald/10 px-1.5 py-0.5 rounded">
            {entity.category || entity.type}
          </span>
          {entity.district && (
            <span className="text-[10px] text-muted-foreground truncate">
              {entity.district}
            </span>
          )}
        </div>

        <h4 className="text-sm font-bold text-foreground leading-tight mb-1">
          {entity.title}
        </h4>

        {entity.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
            {entity.description}
          </p>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onInspect) onInspect(entity);
          }}
          className="w-full mt-1 inline-flex items-center justify-center rounded-md bg-forest-emerald px-2.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-forest-emerald/90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-emerald"
        >
          Inspect Details
        </button>
      </div>
    </Popup>
  );
}
