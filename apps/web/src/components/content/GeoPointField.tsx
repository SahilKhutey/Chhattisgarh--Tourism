'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin } from 'lucide-react';

const GenericMap = dynamic(() => import('./GenericMap'), {
  ssr: false,
  loading: () => (
    <div className="h-44 bg-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">
      Loading interactive map...
    </div>
  ),
});

interface GeoPointFieldProps {
  value?: {
    lat?: number;
    lng?: number;
  };
  onChange: (value: { lat: number; lng: number }) => void;
  label?: string;
  error?: string;
}

export function GeoPointField({
  value,
  onChange,
  label = 'Location',
  error,
}: GeoPointFieldProps) {
  const currentLat = value?.lat ?? 21.2514;
  const currentLng = value?.lng ?? 81.6296;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700">
        <MapPin className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-stone-500 mb-1 font-medium">Latitude (-90 to 90)</label>
          <input
            type="number"
            step="any"
            min="-90"
            max="90"
            value={value?.lat ?? ''}
            onChange={(event) =>
              onChange({
                lat: Number(event.target.value),
                lng: value?.lng ?? 81.6296,
              })
            }
            placeholder="e.g. 21.2514"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>

        <div>
          <label className="block text-stone-500 mb-1 font-medium">Longitude (-180 to 180)</label>
          <input
            type="number"
            step="any"
            min="-180"
            max="180"
            value={value?.lng ?? ''}
            onChange={(event) =>
              onChange({
                lat: value?.lat ?? 21.2514,
                lng: Number(event.target.value),
              })
            }
            placeholder="e.g. 81.6296"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
        </div>
      </div>

      <GenericMap
        lat={currentLat}
        lng={currentLng}
        title={label}
        height="220px"
        interactive={true}
        onLocationSelect={(lat, lng) => onChange({ lat, lng })}
      />

      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
}
export default GeoPointField;
