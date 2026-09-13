"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ApiItinerary } from "../api/itinerary-api";

interface PlanningMapProps {
  itinerary: ApiItinerary;
}

function createNumberedIcon(num: number) {
  return L.divIcon({
    className: "custom-numbered-pin",
    html: `
      <div style="
        background: #065f46;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 12px;
        border: 2px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.25);
      ">${num}</div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

function MapAutoFit({ stops }: { stops: { lat: number; lng: number }[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;
    const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
  }, [stops, map]);

  return null;
}

export function PlanningMap({ itinerary }: PlanningMapProps) {
  const allStops = itinerary.days.flatMap((d) => d.stops);
  const routePoints: [number, number][] = allStops
    .filter((s) => s.place.latitude && s.place.longitude)
    .map((s) => [s.place.latitude, s.place.longitude]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm flex flex-col h-[520px]">
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
            Route Visualization
          </h4>
        </div>
        <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Estimated route · Road Factor 1.25x
        </span>
      </div>

      <div className="relative flex-1">
        <MapContainer
          center={[21.2514, 81.6296]}
          zoom={7}
          className="w-full h-full"
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapAutoFit stops={allStops.map((s) => ({ lat: s.place.latitude, lng: s.place.longitude }))} />

          {routePoints.length > 1 && (
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#059669", weight: 3.5, dashArray: "6, 8" }}
            />
          )}

          {allStops.map((stop, index) => (
            <Marker
              key={stop.id}
              position={[stop.place.latitude, stop.place.longitude]}
              icon={createNumberedIcon(index + 1)}
            >
              <Popup>
                <div className="p-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 block">
                    Stop #{index + 1}
                  </span>
                  <h5 className="font-bold text-stone-900 text-sm leading-tight mb-1">
                    {stop.place.name}
                  </h5>
                  <p className="text-xs text-stone-500 mb-1">
                    {stop.arrivalTime} – {stop.departureTime}
                  </p>
                  {stop.reason && (
                    <p className="text-[11px] text-stone-600 italic bg-stone-50 p-1.5 rounded">
                      {stop.reason}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
