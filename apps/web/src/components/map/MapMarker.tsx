"use client";

import { Marker, Popup } from "react-leaflet";
import type { MapPlace } from "@/lib/geo/geo-types";

interface MapMarkerProps {
  place: MapPlace;
  isSelected?: boolean;
  onClick?: () => void;
}

export function MapMarker({ place, isSelected, onClick }: MapMarkerProps) {
  return (
    <Marker
      position={[place.latitude, place.longitude]}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div>
          <strong>{place.name}</strong>
          {place.district && <div>{place.district}</div>}
        </div>
      </Popup>
    </Marker>
  );
}
