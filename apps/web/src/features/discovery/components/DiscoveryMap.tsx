"use client";

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { DiscoveryPlace } from '../api/discovery-api';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

interface DiscoveryMapProps {
  places: DiscoveryPlace[];
  selectedPlace?: DiscoveryPlace | null;
  onSelectPlace?: (place: DiscoveryPlace) => void;
  className?: string;
}

// Ensure default marker assets resolve properly in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

// Controller component to smoothly pan/zoom map when selected place changes
function MapFocusController({ place }: { place?: DiscoveryPlace | null }) {
  const map = useMap();

  useEffect(() => {
    if (place && place.latitude && place.longitude) {
      map.flyTo([place.latitude, place.longitude], Math.max(map.getZoom(), 11), {
        duration: 1.2,
      });
    }
  }, [place, map]);

  return null;
}

export const DiscoveryMap: React.FC<DiscoveryMapProps> = ({
  places,
  selectedPlace,
  onSelectPlace,
  className = '',
}) => {
  const defaultCenter: [number, number] = [21.25, 81.63]; // Central Chhattisgarh (Raipur)

  const customIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-map-pin',
      html: `<div style="
        background-color: #059669;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 6px; height: 6px; border-radius: 50%;"></div>
      </div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }, []);

  const selectedIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-selected-pin',
      html: `<div style="
        background-color: #dc2626;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="background-color: white; width: 8px; height: 8px; border-radius: 50%;"></div>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }, []);

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <MapContainer
        center={defaultCenter}
        zoom={7}
        minZoom={6}
        maxZoom={16}
        scrollWheelZoom={true}
        className="h-full w-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapFocusController place={selectedPlace} />

        {places
          .filter((p) => p.latitude && p.longitude)
          .map((place) => {
            const isSelected = selectedPlace?.id === place.id;
            return (
              <Marker
                key={place.id}
                position={[place.latitude, place.longitude]}
                icon={isSelected ? selectedIcon : customIcon}
                eventHandlers={{
                  click: () => onSelectPlace?.(place),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-1 min-w-[200px]">
                    {place.district && (
                      <div className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {place.district}
                      </div>
                    )}
                    <h4 className="font-bold text-sm text-zinc-900 mt-0.5">{place.name}</h4>
                    {place.shortDescription && (
                      <p className="text-xs text-zinc-600 line-clamp-2 mt-1">
                        {place.shortDescription}
                      </p>
                    )}
                    <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between">
                      <Link
                        href={`/places/${place.slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                      >
                        View Details
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
};

export default DiscoveryMap;
