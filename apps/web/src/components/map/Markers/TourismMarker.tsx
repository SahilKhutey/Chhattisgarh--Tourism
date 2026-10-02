"use client";

import React, { useMemo } from "react";
import { Marker } from "react-leaflet";
import type { MapEntity } from "@/core/ui/map/entities";
import { isValidCoordinate } from "@/core/ui/map/viewport";
import { createTourismIcon } from "./MarkerIcon";
import { MarkerPopup } from "./MarkerPopup";

export interface TourismMarkerProps {
  entity: MapEntity;
  isSelected?: boolean;
  onSelect?: (entity: MapEntity) => void;
  onInspect?: (entity: MapEntity) => void;
}

export function TourismMarker({
  entity,
  isSelected = false,
  onSelect,
  onInspect,
}: TourismMarkerProps) {
  const coordinateValid = isValidCoordinate({
    latitude: entity.latitude,
    longitude: entity.longitude,
  });

  const icon = useMemo(() => {
    return createTourismIcon({
      type: entity.type,
      label: entity.title,
      isSelected,
      priority: entity.priority,
    });
  }, [entity.type, entity.title, isSelected, entity.priority]);

  if (!coordinateValid) {
    return null;
  }

  return (
    <Marker
      position={[entity.latitude, entity.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onSelect) {
            onSelect(entity);
          }
        },
      }}
    >
      <MarkerPopup
        entity={entity}
        onInspect={() => {
          if (onInspect) {
            onInspect(entity);
          } else if (onSelect) {
            onSelect(entity);
          }
        }}
      />
    </Marker>
  );
}
