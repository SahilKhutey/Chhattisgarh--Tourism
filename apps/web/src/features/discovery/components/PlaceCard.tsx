"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Navigation, Mountain, ArrowRight } from 'lucide-react';
import { DiscoveryPlace } from '../api/discovery-api';

interface PlaceCardProps {
  place: DiscoveryPlace;
  isSelected?: boolean;
  onSelect?: (place: DiscoveryPlace) => void;
}

export const PlaceCard: React.FC<PlaceCardProps> = ({
  place,
  isSelected,
  onSelect,
}) => {
  const formattedDistance =
    place.distanceMeters !== undefined
      ? place.distanceMeters < 1000
        ? `${place.distanceMeters} m`
        : `${(place.distanceMeters / 1000).toFixed(1)} km`
      : null;

  return (
    <div
      onClick={() => onSelect?.(place)}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-lg bg-white dark:bg-zinc-900 cursor-pointer ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md'
          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-zinc-100 dark:bg-zinc-800">
        {place.heroImage ? (
          <Image
            src={place.heroImage}
            alt={place.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400">
            <Mountain className="h-10 w-10 stroke-1" />
          </div>
        )}

        {/* Category Badge */}
        {place.category && (
          <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-medium text-white shadow-sm">
            {place.category}
          </span>
        )}

        {/* Proximity / Distance Badge */}
        {formattedDistance && (
          <span className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Navigation className="h-3 w-3 fill-white" />
            {formattedDistance}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {/* District & Altitude */}
        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-1.5">
          {place.district ? (
            <span className="flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
              <MapPin className="h-3.5 w-3.5" />
              {place.district}
            </span>
          ) : (
            <span />
          )}

          {place.altitudeMeters && (
            <span className="flex items-center gap-1">
              <Mountain className="h-3 w-3" />
              {Math.round(place.altitudeMeters)} m
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
          {place.name}
        </h3>

        {/* Short Description */}
        {place.shortDescription && (
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {place.shortDescription}
          </p>
        )}

        {/* Action Link */}
        <div className="mt-auto pt-4 flex items-center justify-between">
          <Link
            href={`/places/${place.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300"
          >
            Explore Destination
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
