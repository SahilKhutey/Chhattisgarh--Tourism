"use client";

import React from "react";
import { RuntimeField } from "../../../types/content-entry";
import { FieldWrapper } from "./FieldWrapper";

interface FieldProps {
  field: RuntimeField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

interface GeoPointValue {
  latitude?: number | null;
  longitude?: number | null;
}

export function GeoPointField({ field, value, onChange, error, disabled }: FieldProps) {
  const geoValue: GeoPointValue = typeof value === "object" && value !== null
    ? (value as GeoPointValue)
    : { latitude: null, longitude: null };

  const bounds = field.config?.bounds as Record<string, number> | undefined;

  const handleLatChange = (val: string) => {
    const lat = val === "" ? null : Number(val);
    onChange({ ...geoValue, latitude: lat });
  };

  const handleLngChange = (val: string) => {
    const lng = val === "" ? null : Number(val);
    onChange({ ...geoValue, longitude: lng });
  };

  return (
    <FieldWrapper field={field} error={error}>
      <div className="space-y-2 p-3 border rounded-md border-gray-300 bg-gray-50/50">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${field.key}-lat`} className="block text-xs font-medium text-gray-700 mb-1">
              Latitude (-90 to 90)
            </label>
            <input
              id={`${field.key}-lat`}
              type="number"
              step="any"
              value={geoValue.latitude !== null && geoValue.latitude !== undefined ? String(geoValue.latitude) : ""}
              onChange={(e) => handleLatChange(e.target.value)}
              placeholder="e.g. 21.25"
              disabled={disabled}
              className="w-full px-3 py-1.5 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
            />
          </div>
          <div>
            <label htmlFor={`${field.key}-lng`} className="block text-xs font-medium text-gray-700 mb-1">
              Longitude (-180 to 180)
            </label>
            <input
              id={`${field.key}-lng`}
              type="number"
              step="any"
              value={geoValue.longitude !== null && geoValue.longitude !== undefined ? String(geoValue.longitude) : ""}
              onChange={(e) => handleLngChange(e.target.value)}
              placeholder="e.g. 81.63"
              disabled={disabled}
              className="w-full px-3 py-1.5 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500 text-sm bg-white"
            />
          </div>
        </div>
        {bounds && (
          <p className="text-xs text-gray-500">
            Allowed range: Lat [{bounds.min_latitude}, {bounds.max_latitude}], Lng [{bounds.min_longitude}, {bounds.max_longitude}]
          </p>
        )}
      </div>
    </FieldWrapper>
  );
}

export function MapRegionField({ field, value, onChange, error, disabled }: FieldProps) {
  const jsonString = typeof value === "object" && value !== null
    ? JSON.stringify(value, null, 2)
    : typeof value === "string" ? value : "";

  return (
    <FieldWrapper field={field} error={error}>
      <textarea
        id={field.key}
        name={field.key}
        value={jsonString}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            onChange(parsed);
          } catch {
            onChange(e.target.value);
          }
        }}
        placeholder='{"type": "Polygon", "coordinates": [...]}'
        disabled={disabled}
        rows={4}
        className="w-full font-mono text-xs px-3 py-2 border rounded-md shadow-sm border-gray-300 focus:ring-amber-500 focus:border-amber-500"
      />
    </FieldWrapper>
  );
}
