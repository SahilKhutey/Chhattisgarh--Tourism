'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { FieldRendererProps } from './field-registry';

const GenericMap = dynamic(
  () => import('../content/GenericMap').then((mod) => mod.GenericMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-56 bg-stone-100 rounded-xl flex items-center justify-center text-xs text-stone-400 animate-pulse">
        Loading geographic map...
      </div>
    ),
  },
);

export function parseCoordinates(value: unknown): { lat: number; lng: number } | null {
  if (!value) return null;

  if (typeof value === 'object') {
    const val = value as Record<string, unknown>;
    if (typeof val.lat === 'number' && typeof val.lng === 'number') {
      return { lat: val.lat, lng: val.lng };
    }
    if (typeof val.latitude === 'number' && typeof val.longitude === 'number') {
      return { lat: val.latitude, lng: val.longitude };
    }
    // GeoJSON Point: coordinates: [lng, lat]
    if (
      val.type === 'Point' &&
      Array.isArray(val.coordinates) &&
      val.coordinates.length >= 2
    ) {
      return {
        lat: Number(val.coordinates[1]),
        lng: Number(val.coordinates[0]),
      };
    }
  }

  if (Array.isArray(value) && value.length >= 2) {
    const lat = Number(value[0]);
    const lng = Number(value[1]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }

  if (typeof value === 'string') {
    const parts = value.split(',').map((p) => parseFloat(p.trim()));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return { lat: parts[0], lng: parts[1] };
    }
  }

  return null;
}

export const GeoField: React.FC<FieldRendererProps> = ({ field, value }) => {
  const coords = parseCoordinates(value);

  if (!coords) {
    return (
      <div className="py-2 text-stone-400 text-xs italic">
        No location coordinates specified.
      </div>
    );
  }

  const { lat, lng } = coords;
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const osmUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=14/${lat}/${lng}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
          {field.label || 'Geographic Location'}
        </span>
        <div className="flex items-center gap-3 text-xs">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition-colors"
          >
            <Navigation className="w-3.5 h-3.5" />
            Google Maps
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-800 font-medium transition-colors"
          >
            OpenStreetMap
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-60" />
          </a>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden border border-stone-200 shadow-sm">
        <GenericMap lat={lat} lng={lng} title={field.label} height="260px" />
      </div>

      <div className="text-[11px] font-mono text-stone-500 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 inline-block">
        Lat: {lat.toFixed(6)} | Lng: {lng.toFixed(6)}
      </div>
    </div>
  );
};
