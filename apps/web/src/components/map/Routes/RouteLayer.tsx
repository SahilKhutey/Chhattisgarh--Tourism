"use client";

import React from "react";
import { Polyline, CircleMarker, Tooltip } from "react-leaflet";
import type { MapRoute } from "@/core/ui/map/routes";
import { isValidRoute } from "@/core/ui/map/routes";

export interface RouteLayerProps {
  routes: MapRoute[];
  selectedRouteId?: string | null;
  onSelectRoute?: (route: MapRoute) => void;
}

export function RouteLayer({
  routes,
  selectedRouteId,
  onSelectRoute,
}: RouteLayerProps) {
  const validRoutes = routes.filter(isValidRoute);

  return (
    <>
      {validRoutes.map((route) => {
        const isSelected = selectedRouteId === route.id;
        const positions: [number, number][] = route.coordinates.map((c) => [
          c.latitude,
          c.longitude,
        ]);

        const routeColor = route.color || "#C85A32";

        return (
          <React.Fragment key={route.id}>
            {/* Background Halo for selected route */}
            {isSelected && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: "#FFFFFF",
                  weight: 8,
                  opacity: 0.9,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            )}

            {/* Main Polyline */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: routeColor,
                weight: isSelected ? 5 : 3.5,
                opacity: isSelected ? 1 : 0.75,
                dashArray: isSelected ? undefined : "6, 6",
                lineCap: "round",
                lineJoin: "round",
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectRoute) {
                    onSelectRoute(route);
                  }
                },
              }}
            >
              <Tooltip sticky>
                <div className="text-xs font-semibold">
                  <span>{route.title}</span>
                  {route.distanceMeters && (
                    <span className="block text-[10px] text-muted-foreground">
                      {(route.distanceMeters / 1000).toFixed(1)} km
                    </span>
                  )}
                </div>
              </Tooltip>
            </Polyline>

            {/* Start and End Waypoint Markers */}
            {positions.length > 0 && (
              <CircleMarker
                center={positions[0]}
                radius={isSelected ? 6 : 4}
                pathOptions={{
                  fillColor: "#2D5A27",
                  fillOpacity: 1,
                  color: "#FFFFFF",
                  weight: 2,
                }}
              />
            )}
            {positions.length > 1 && (
              <CircleMarker
                center={positions[positions.length - 1]}
                radius={isSelected ? 6 : 4}
                pathOptions={{
                  fillColor: "#C85A32",
                  fillOpacity: 1,
                  color: "#FFFFFF",
                  weight: 2,
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
