"use client";

import React from 'react';
import { Navigation, LocateFixed, AlertCircle } from 'lucide-react';
import { PlaceCard } from './PlaceCard';
import { useNearbyPlaces } from '../hooks/useNearbyPlaces';
import { DiscoveryPlace } from '../api/discovery-api';

const RADIUS_OPTIONS = [
  { value: 10000, label: '10 km' },
  { value: 25000, label: '25 km' },
  { value: 50000, label: '50 km' },
  { value: 100000, label: '100 km' },
];

interface NearbyPlacesProps {
  onSelectPlace?: (place: DiscoveryPlace) => void;
  selectedPlaceId?: string;
  className?: string;
}

export const NearbyPlaces: React.FC<NearbyPlacesProps> = ({
  onSelectPlace,
  selectedPlaceId,
  className = '',
}) => {
  const {
    location,
    radius,
    setRadius,
    places,
    loading,
    error,
    permissionState,
    detectLocation,
  } = useNearbyPlaces(25000);

  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Navigation className="h-5 w-5 text-emerald-600 fill-emerald-600" />
            Explore Places Near You
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time PostGIS proximity calculations from your current location
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Radius selector */}
          <div className="flex items-center rounded-xl border border-zinc-200 dark:border-zinc-800 p-1 bg-zinc-50 dark:bg-zinc-900">
            {RADIUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRadius(opt.value)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  radius === opt.value
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={detectLocation}
            title="Update Location"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 p-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <LocateFixed className="h-4 w-4 text-emerald-600" />
          </button>
        </div>
      </div>

      {/* Permission alert note if fallback */}
      {permissionState === 'denied' && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 p-3 text-xs text-amber-800 dark:text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Location access was not granted. Proximity is measured relative to central Chhattisgarh (Raipur).</span>
        </div>
      )}

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(3)].map((_, i) => (
            <div
              key={`nearby-skeleton-${i}`}
              className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 animate-pulse"
            >
              <div className="aspect-[16/10] w-full rounded-xl bg-zinc-100 dark:bg-zinc-800 mb-4" />
              <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
              <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      ) : places.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 p-10 text-center text-xs text-zinc-500">
          No destinations found within {radius / 1000} km. Try increasing the search radius above.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              isSelected={selectedPlaceId === place.id}
              onSelect={onSelectPlace}
            />
          ))}
        </div>
      )}
    </div>
  );
};
