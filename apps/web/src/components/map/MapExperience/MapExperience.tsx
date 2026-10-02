"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import type { MapEntity } from "@/core/ui/map/entities";
import { filterEntitiesByZoom, filterEntitiesByLayers } from "@/core/ui/map/entities";
import type { MapRoute } from "@/core/ui/map/routes";
import type { MapGuide, MapGuideStep } from "@/core/ui/map/guides";
import type { MapViewport, MapBounds, GeoCoordinate } from "@/core/ui/map/viewport";
import { DEFAULT_VIEWPORT, isValidCoordinate } from "@/core/ui/map/viewport";
import type { MapUIState, MapMode } from "@/core/ui/map/types";
import { DEFAULT_MAP_LAYERS } from "@/core/ui/map/types";
import { entityToDetails, routeToDetails } from "@/core/ui/map/details";
import { transitionMapState } from "@/core/ui/map/state";
import { trackUIEvent } from "@/core/ui/telemetry";

import { MapCanvas } from "../MapCanvas/MapCanvas";
import { TourismMarker } from "../Markers/TourismMarker";
import { RouteLayer } from "../Routes/RouteLayer";
import { RouteDetails } from "../Routes/RouteDetails";
import { MapGuide as MapGuideComponent } from "../Guides/MapGuide";
import { MapOverview } from "../Overview/MapOverview";
import { MapDetailsPanel } from "../Details/MapDetailsPanel";
import { MapControls } from "../MapControls/MapControls";
import { LayerControl } from "../MapLayers/LayerControl";
import { MapResultList } from "../MapResultList";

export interface MapExperienceProps {
  entities: MapEntity[];
  routes?: MapRoute[];
  guides?: MapGuide[];
  initialViewport?: MapViewport;
  initialMode?: MapMode;
  initialSelectedId?: string | null;
  onEntitySelect?: (entity: MapEntity) => void;
  onRouteSelect?: (route: MapRoute) => void;
  onGuideSelect?: (guide: MapGuide) => void;
  onAction?: (actionId: string, model: unknown) => void;
  className?: string;
  showResultList?: boolean;
  regionName?: string;
}

export function MapExperience({
  entities,
  routes = [],
  guides = [],
  initialViewport = DEFAULT_VIEWPORT,
  initialMode = "observer",
  initialSelectedId = null,
  onEntitySelect,
  onRouteSelect,
  onGuideSelect,
  onAction,
  className = "",
  showResultList = true,
  regionName = "Chhattisgarh State",
}: MapExperienceProps) {
  const containerRef = useRef<HTMLElement>(null);
  const [viewport, setViewport] = useState<MapViewport>(initialViewport);
  const [uiState, setUiState] = useState<MapUIState>(() =>
    initialSelectedId
      ? { type: "selected", entityId: initialSelectedId }
      : { type: "idle" },
  );

  const [baseLayer, setBaseLayer] = useState<"standard" | "terrain" | "satellite">("standard");
  const [enabledLayers, setEnabledLayers] = useState<string[]>(() =>
    DEFAULT_MAP_LAYERS.filter((l) => l.enabled).map((l) => l.id),
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeStepId, setActiveStepId] = useState<string | undefined>(undefined);

  // Track map opened telemetry on mount
  useEffect(() => {
    trackUIEvent({
      name: "map_interaction",
      metadata: {
        action: "opened",
        entitiesCount: entities.length,
        routesCount: routes.length,
        mode: initialMode,
      },
    });
  }, [entities.length, routes.length, initialMode]);

  // Synchronize initialSelectedId
  useEffect(() => {
    if (initialSelectedId) {
      setUiState({ type: "selected", entityId: initialSelectedId });
    }
  }, [initialSelectedId]);

  // Layer filtering and Zoom filtering
  const visibleEntities = useMemo(() => {
    const layerFiltered = filterEntitiesByLayers(entities, enabledLayers);
    return filterEntitiesByZoom(layerFiltered, viewport.zoom);
  }, [entities, enabledLayers, viewport.zoom]);

  // Active entity details resolution
  const activeEntity = useMemo(() => {
    if (uiState.type === "selected" || uiState.type === "details") {
      return entities.find((e) => e.id === uiState.entityId) || null;
    }
    return null;
  }, [uiState, entities]);

  const activeDetails = useMemo(() => {
    if (activeEntity && (uiState.type === "details" || uiState.type === "selected")) {
      return entityToDetails(activeEntity);
    }
    return null;
  }, [activeEntity, uiState.type]);

  // Active route resolution
  const activeRoute = useMemo(() => {
    if (uiState.type === "route") {
      return routes.find((r) => r.id === uiState.routeId) || null;
    }
    return null;
  }, [uiState, routes]);

  // Active guide resolution
  const activeGuide = useMemo(() => {
    if (uiState.type === "guide") {
      return guides.find((g) => g.id === uiState.guideId) || null;
    }
    return null;
  }, [uiState, guides]);

  // Viewport controllers
  const handleZoomIn = useCallback(() => {
    setViewport((prev) => {
      const newZoom = Math.min(prev.zoom + 1, 18);
      trackUIEvent({
        name: "map_interaction",
        metadata: { action: "zoomed", zoom: newZoom },
      });
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setViewport((prev) => {
      const newZoom = Math.max(prev.zoom - 1, 5);
      trackUIEvent({
        name: "map_interaction",
        metadata: { action: "zoomed", zoom: newZoom },
      });
      return { ...prev, zoom: newZoom };
    });
  }, []);

  const handleLocate = useCallback((coord: GeoCoordinate) => {
    if (isValidCoordinate(coord)) {
      setViewport({ center: coord, zoom: 12 });
      trackUIEvent({
        name: "map_interaction",
        metadata: {
          action: "locate_requested",
          latitude: coord.latitude,
          longitude: coord.longitude,
        },
      });
    }
  }, []);

  const handleResetView = useCallback(() => {
    setViewport(DEFAULT_VIEWPORT);
    setUiState({ type: "idle" });
  }, []);

  const handleToggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => {
      const next = !prev;
      trackUIEvent({
        name: "map_interaction",
        metadata: { action: "fullscreen_entered", isFullscreen: next },
      });
      return next;
    });
  }, []);

  // Entity selection & inspection
  const handleSelectEntity = useCallback(
    (entity: MapEntity) => {
      setUiState({ type: "selected", entityId: entity.id });
      setViewport((prev) => ({
        center: { latitude: entity.latitude, longitude: entity.longitude },
        zoom: Math.max(prev.zoom, 11),
      }));
      trackUIEvent({
        name: "map_interaction",
        entityId: entity.id,
        metadata: {
          action: "marker_selected",
          entityType: entity.type,
        },
      });
      if (onEntitySelect) onEntitySelect(entity);
    },
    [onEntitySelect],
  );

  const handleInspectEntity = useCallback(
    (entity: MapEntity) => {
      setUiState({ type: "details", entityId: entity.id });
      setViewport((prev) => ({
        center: { latitude: entity.latitude, longitude: entity.longitude },
        zoom: Math.max(prev.zoom, 12),
      }));
      trackUIEvent({
        name: "map_interaction",
        entityId: entity.id,
        metadata: { action: "details_opened" },
      });
      if (onEntitySelect) onEntitySelect(entity);
    },
    [onEntitySelect],
  );

  // Route selection
  const handleSelectRoute = useCallback(
    (route: MapRoute) => {
      setUiState({ type: "route", routeId: route.id });
      if (route.coordinates.length > 0) {
        setViewport({
          center: route.coordinates[0],
          zoom: 10,
        });
      }
      trackUIEvent({
        name: "map_interaction",
        entityId: route.id,
        metadata: { action: "route_selected" },
      });
      if (onRouteSelect) onRouteSelect(route);
    },
    [onRouteSelect],
  );

  // Guide step selection
  const handleSelectGuideStep = useCallback(
    (step: MapGuideStep) => {
      setActiveStepId(step.id);
      if (step.coordinate && isValidCoordinate(step.coordinate)) {
        setViewport({
          center: step.coordinate,
          zoom: 13,
        });
      }
      if (step.entityId) {
        setUiState({ type: "selected", entityId: step.entityId });
      }
      trackUIEvent({
        name: "map_interaction",
        entityId: step.id,
        metadata: {
          action: "guide_step_selected",
          order: step.order,
        },
      });
    },
    [],
  );

  // Layer toggling
  const handleToggleLayer = useCallback((layerId: string) => {
    setEnabledLayers((prev) => {
      const next = prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId];
      trackUIEvent({
        name: "map_interaction",
        metadata: { action: "layer_changed", layerId, enabled: !prev.includes(layerId) },
      });
      return next;
    });
  }, []);

  return (
    <section
      ref={containerRef}
      aria-label="Tourism geographic observer experience"
      className={`relative flex flex-col lg:flex-row overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 shadow-xl dark:border-neutral-800 dark:bg-neutral-950 ${
        isFullscreen ? "fixed inset-0 z-[9999] rounded-none border-0 h-screen w-screen" : "h-[75vh] min-h-[500px]"
      } ${className}`}
    >
      {/* Map Canvas Viewport */}
      <div className="relative flex-1 h-full min-h-[380px] overflow-hidden">
        <MapCanvas
          viewport={viewport}
          baseLayer={baseLayer}
          onViewportChange={setViewport}
        >
          {/* Tourism Markers */}
          {visibleEntities.map((entity) => (
            <TourismMarker
              key={entity.id}
              entity={entity}
              isSelected={activeEntity?.id === entity.id}
              onSelect={handleSelectEntity}
              onInspect={handleInspectEntity}
            />
          ))}

          {/* Tourism Corridor Routes */}
          {enabledLayers.includes("tourism-routes") && routes.length > 0 && (
            <RouteLayer
              routes={routes}
              selectedRouteId={activeRoute?.id}
              onSelectRoute={handleSelectRoute}
            />
          )}
        </MapCanvas>

        {/* Observer Overview HUD (Top Left) */}
        <div className="absolute top-4 left-4 z-[900] pointer-events-auto max-w-[280px]">
          <MapOverview
            entities={entities}
            regionName={regionName}
            zoom={viewport.zoom}
            routesCount={routes.length}
            guidesCount={guides.length}
          />
        </div>

        {/* Observer Controls (Bottom Right) */}
        <div className="absolute bottom-4 right-4 z-[900] pointer-events-auto">
          <MapControls
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onLocate={handleLocate}
            onResetView={handleResetView}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
          />
        </div>

        {/* Layer Selector (Top Right) */}
        <div className="absolute top-4 right-4 z-[900] pointer-events-auto">
          <LayerControl
            enabledLayers={enabledLayers}
            baseLayer={baseLayer}
            onToggleLayer={handleToggleLayer}
            onSelectBaseLayer={setBaseLayer}
          />
        </div>

        {/* Details Panel (Observer Style) */}
        {activeDetails && (
          <MapDetailsPanel
            details={activeDetails}
            onClose={() => setUiState({ type: "idle" })}
            onAction={onAction}
          />
        )}

        {/* Route Details Panel */}
        {activeRoute && (
          <RouteDetails
            route={activeRoute}
            onClose={() => setUiState({ type: "idle" })}
            onAddToTrip={(r) => onAction && onAction("add-to-trip", r)}
          />
        )}

        {/* Trail Guide Panel */}
        {activeGuide && (
          <MapGuideComponent
            guide={activeGuide}
            activeStepId={activeStepId}
            onSelectStep={handleSelectGuideStep}
            onClose={() => setUiState({ type: "idle" })}
          />
        )}
      </div>

      {/* Accessible Result List Side Column (Map ↔ List Synchronized) */}
      {showResultList && !isFullscreen && (
        <div className="w-full lg:w-80 h-48 lg:h-full border-t lg:border-t-0 lg:border-l border-neutral-200/80 dark:border-neutral-800 flex flex-col shrink-0">
          <MapResultList
            entities={visibleEntities}
            selectedEntityId={activeEntity?.id}
            onSelectEntity={handleSelectEntity}
            onInspectEntity={handleInspectEntity}
            className="h-full"
          />
        </div>
      )}
    </section>
  );
}
