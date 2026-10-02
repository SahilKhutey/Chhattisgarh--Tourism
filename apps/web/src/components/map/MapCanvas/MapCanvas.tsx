"use client";

import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import type { MapViewport, MapBounds } from "@/core/ui/map/viewport";
import { isValidCoordinate } from "@/core/ui/map/viewport";
import { useReducedMotion } from "@/core/ui/motion";
import "leaflet/dist/leaflet.css";

export interface MapCanvasProps {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  baseLayer?: "standard" | "terrain" | "satellite";
  onLayerError?: (layer: "standard" | "terrain" | "satellite") => void;
  children?: React.ReactNode;
  className?: string;
  interactive?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

export const TILE_LAYERS = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
  terrain: {
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, SRTM | Style: &copy; <a href="https://opentopomap.org" target="_blank" rel="noopener noreferrer">OpenTopoMap</a>',
    maxZoom: 17,
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    maxZoom: 18,
  },
} as const;

function ViewportController({
  viewport,
  onViewportChange,
  onBoundsChange,
  reducedMotion,
}: {
  viewport: MapViewport;
  onViewportChange?: (viewport: MapViewport) => void;
  onBoundsChange?: (bounds: MapBounds) => void;
  reducedMotion: boolean;
}) {
  const map = useMap();

  const { latitude, longitude } = viewport.center;

  useEffect(() => {
    if (!isValidCoordinate({ latitude, longitude })) return;

    const currentCenter = map.getCenter();
    const currentZoom = map.getZoom();

    const latDiff = Math.abs(currentCenter.lat - latitude);
    const lngDiff = Math.abs(currentCenter.lng - longitude);
    const zoomDiff = Math.abs(currentZoom - viewport.zoom);

    // Only update if there is a meaningful difference
    if (latDiff > 0.0001 || lngDiff > 0.0001 || zoomDiff > 0.1) {
      map.setView(
        [latitude, longitude],
        viewport.zoom,
        {
          animate: !reducedMotion,
          duration: reducedMotion ? 0 : 0.75,
        },
      );
    }
  }, [latitude, longitude, viewport.zoom, map, reducedMotion]);

  useMapEvents({
    moveend() {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();

      if (onViewportChange) {
        onViewportChange({
          center: {
            latitude: Number(center.lat.toFixed(6)),
            longitude: Number(center.lng.toFixed(6)),
          },
          zoom,
        });
      }

      if (onBoundsChange) {
        onBoundsChange({
          north: Number(bounds.getNorth().toFixed(6)),
          south: Number(bounds.getSouth().toFixed(6)),
          east: Number(bounds.getEast().toFixed(6)),
          west: Number(bounds.getWest().toFixed(6)),
        });
      }
    },
  });

  return null;
}

export function MapCanvas({
  viewport,
  onViewportChange,
  onBoundsChange,
  baseLayer = "standard",
  onLayerError,
  children,
  className = "h-full w-full",
  interactive = true,
  minZoom = 5,
  maxZoom = 19,
}: MapCanvasProps) {
  const reducedMotion = useReducedMotion();
  const selectedTileConfig = TILE_LAYERS[baseLayer] || TILE_LAYERS.standard;

  const validCenter: [number, number] = isValidCoordinate(viewport.center)
    ? [viewport.center.latitude, viewport.center.longitude]
    : [21.2514, 81.6296];

  return (
    <div className={`relative h-full w-full overflow-hidden ${className}`}>
      <MapContainer
        center={validCenter}
        zoom={viewport.zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        keyboard={interactive}
        attributionControl={true}
        zoomControl={false}
        className="h-full w-full outline-none focus-visible:ring-2 focus-visible:ring-forest-emerald"
      >
        <TileLayer
          key={baseLayer}
          url={selectedTileConfig.url}
          attribution={selectedTileConfig.attribution}
          maxZoom={selectedTileConfig.maxZoom}
          eventHandlers={{
            tileerror: () => {
              if (onLayerError) {
                onLayerError(baseLayer);
              }
            },
          }}
        />

        <ViewportController
          viewport={viewport}
          onViewportChange={onViewportChange}
          onBoundsChange={onBoundsChange}
          reducedMotion={reducedMotion}
        />

        {children}
      </MapContainer>
    </div>
  );
}
