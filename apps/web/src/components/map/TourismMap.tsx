"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Star, MapPin, Eye, Navigation, Layers } from "lucide-react";
import type { MapPlace, RouteResult } from "@/lib/geo/geo-types";
import { formatDistance, formatDuration } from "@/lib/geo/geo-utils";
import "leaflet/dist/leaflet.css";

// Create custom colored Leaflet markers
function createCustomIcon(color: string = "#2D5A27") {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 42" width="32" height="42">
      <defs>
        <filter id="shadow" x="-20%" y="-10%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
      </defs>
      <path d="M16 0C7.16 0 0 7.16 0 16c0 10.5 16 26 16 26s16-15.5 16-26C32 7.16 24.84 0 16 0z" fill="${color}" filter="url(#shadow)"/>
      <circle cx="16" cy="16" r="7" fill="#ffffff"/>
      <circle cx="16" cy="16" r="4" fill="${color}"/>
    </svg>
  `;
  return L.divIcon({
    html: svg,
    className: "custom-geo-marker",
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
}

const defaultMarkerIcon = createCustomIcon("#2D5A27"); // Forest Emerald
const selectedMarkerIcon = createCustomIcon("#C85A32"); // Tribal Terracotta
const originMarkerIcon = createCustomIcon("#2563EB"); // Blue origin pin

interface TourismMapProps {
  places: MapPlace[];
  selectedPlaceId?: string | null;
  onSelectPlace?: (place: MapPlace) => void;
  route?: RouteResult | null;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  height?: number | string;
  className?: string;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
}

function MapController({
  center,
  zoom,
  onBoundsChange,
}: {
  center: [number, number];
  zoom: number;
  onBoundsChange?: (b: { north: number; south: number; east: number; west: number }) => void;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  useMapEvents({
    moveend() {
      if (onBoundsChange) {
        const bounds = map.getBounds();
        onBoundsChange({
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest(),
        });
      }
    },
  });

  return null;
}

export default function TourismMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  route,
  latitude = 21.2514,
  longitude = 81.6296,
  zoom = 7,
  height = 650,
  className = "",
  onBoundsChange,
}: TourismMapProps) {
  const [activeTileLayer, setActiveTileLayer] = useState<"standard" | "satellite" | "topo">("standard");

  const tileLayers = {
    standard: {
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    },
    topo: {
      url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    },
  };

  const centerCoords: [number, number] = useMemo(() => {
    if (selectedPlaceId) {
      const selected = places.find((p) => p.id === selectedPlaceId);
      if (selected) return [selected.latitude, selected.longitude];
    }
    return [latitude, longitude];
  }, [selectedPlaceId, places, latitude, longitude]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden shadow-xl border border-charcoal-stone/10 ${className}`} style={{ height }}>
      {/* Map Layer Switcher Control */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-charcoal-stone/10 p-1.5 flex gap-1">
        <button
          onClick={() => setActiveTileLayer("standard")}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${activeTileLayer === "standard" ? "bg-forest-emerald text-white" : "text-charcoal-stone hover:bg-sand-beige"}`}
        >
          Street
        </button>
        <button
          onClick={() => setActiveTileLayer("satellite")}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${activeTileLayer === "satellite" ? "bg-forest-emerald text-white" : "text-charcoal-stone hover:bg-sand-beige"}`}
        >
          Satellite
        </button>
        <button
          onClick={() => setActiveTileLayer("topo")}
          className={`px-2.5 py-1 text-xs font-bold rounded-xl transition-all ${activeTileLayer === "topo" ? "bg-forest-emerald text-white" : "text-charcoal-stone hover:bg-sand-beige"}`}
        >
          Topo
        </button>
      </div>

      {/* Route Info HUD */}
      {route && (
        <div className="absolute top-4 left-4 z-[1000] bg-charcoal-stone/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-white/15 flex items-center gap-4">
          <Navigation className="h-5 w-5 text-tribal-terracotta animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/60">Estimated Route</span>
            <span className="text-sm font-bold text-white">
              {formatDistance(route.distanceMeters)} · {formatDuration(route.durationSeconds)}
            </span>
          </div>
        </div>
      )}

      <MapContainer
        center={centerCoords}
        zoom={zoom}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={tileLayers[activeTileLayer].url}
          attribution={tileLayers[activeTileLayer].attribution}
        />

        <MapController
          center={centerCoords}
          zoom={selectedPlaceId ? 11 : zoom}
          onBoundsChange={onBoundsChange}
        />

        {/* Route Polyline */}
        {route && route.geometry.length > 0 && (
          <Polyline
            positions={route.geometry}
            pathOptions={{
              color: "#C85A32",
              weight: 5,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {/* Destination Markers */}
        {places.map((place) => {
          const isSelected = selectedPlaceId === place.id;
          return (
            <Marker
              key={place.id}
              position={[place.latitude, place.longitude]}
              icon={isSelected ? selectedMarkerIcon : defaultMarkerIcon}
              eventHandlers={{
                click: () => {
                  if (onSelectPlace) onSelectPlace(place);
                },
              }}
            >
              <Popup className="tourism-map-popup">
                <div className="p-1 max-w-[220px]">
                  {place.heroImage && (
                    <img
                      src={place.heroImage}
                      alt={place.name}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <h4 className="font-bold text-sm text-charcoal-stone leading-tight mb-1">
                    {place.name}
                  </h4>
                  {place.district && (
                    <p className="text-[11px] text-charcoal-stone/60 flex items-center gap-1 mb-1">
                      <MapPin className="h-3 w-3" />
                      {place.district}
                    </p>
                  )}
                  {place.distanceMeters !== undefined && (
                    <p className="text-[11px] font-mono text-forest-emerald font-bold mb-2">
                      {formatDistance(place.distanceMeters)} away
                    </p>
                  )}
                  <Link
                    href={`/destinations/${place.slug}`}
                    className="inline-flex items-center justify-center w-full gap-1 py-1.5 bg-forest-emerald text-white rounded-lg text-xs font-bold hover:bg-tribal-terracotta transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" /> View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
