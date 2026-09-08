'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Map } from 'lucide-react';

const GenericMap = dynamic(() => import('./GenericMap'), {
  ssr: false,
  loading: () => (
    <div className="h-44 bg-stone-100 rounded-lg flex items-center justify-center text-xs text-stone-400">
      Loading region map...
    </div>
  ),
});

interface MapRegionFieldProps {
  value?: any;
  onChange: (value: any) => void;
  label?: string;
  error?: string;
}

export function MapRegionField({
  value,
  onChange,
  label = 'Map Region',
  error,
}: MapRegionFieldProps) {
  const jsonStr = typeof value === 'object' && value !== null ? JSON.stringify(value, null, 2) : String(value ?? '');

  const handleJsonChange = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      onChange(parsed);
    } catch {
      onChange(str);
    }
  };

  return (
    <div className="space-y-2 text-xs">
      <div className="flex items-center gap-1.5 font-semibold text-stone-700">
        <Map className="w-4 h-4 text-emerald-600" />
        <span>{label}</span>
      </div>

      <textarea
        rows={3}
        value={jsonStr}
        onChange={(e) => handleJsonChange(e.target.value)}
        placeholder="Paste GeoJSON Polygon/MultiPolygon or region boundary..."
        className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
      />

      {typeof value === 'object' && value !== null && (
        <GenericMap
          geoJson={value}
          height="200px"
        />
      )}

      {error && <p className="text-red-600 font-medium">{error}</p>}
    </div>
  );
}
export default MapRegionField;
