"use client";

import React, { useMemo } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import type { MarkerCluster as MarkerClusterModel } from "@/core/ui/map/markers";
import { isValidCoordinate } from "@/core/ui/map/viewport";

export interface MarkerClusterProps {
  cluster: MarkerClusterModel;
  onClusterClick?: (cluster: MarkerClusterModel) => void;
}

export function MarkerCluster({ cluster, onClusterClick }: MarkerClusterProps) {
  const map = useMap();

  const icon = useMemo(() => {
    const size = cluster.count >= 50 ? 46 : cluster.count >= 20 ? 40 : 34;
    const half = size / 2;

    const html = `
      <div 
        class="cg-marker-cluster flex items-center justify-center rounded-full bg-forest-emerald/90 text-white font-bold shadow-lg border-2 border-white transition-transform hover:scale-110"
        style="width: ${size}px; height: ${size}px; font-size: ${size > 40 ? 14 : 12}px;"
        role="button"
        tabindex="0"
        aria-label="Cluster of ${cluster.count} places"
      >
        <span>${cluster.count}</span>
      </div>
    `;

    return L.divIcon({
      html,
      className: "cg-cluster-icon",
      iconSize: [size, size],
      iconAnchor: [half, half],
    });
  }, [cluster.count]);

  if (!isValidCoordinate(cluster.center)) {
    return null;
  }

  return (
    <Marker
      position={[cluster.center.latitude, cluster.center.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => {
          if (onClusterClick) {
            onClusterClick(cluster);
          } else {
            // Zoom in on cluster center
            map.setView(
              [cluster.center.latitude, cluster.center.longitude],
              map.getZoom() + 2,
              { animate: true },
            );
          }
        },
      }}
    />
  );
}
