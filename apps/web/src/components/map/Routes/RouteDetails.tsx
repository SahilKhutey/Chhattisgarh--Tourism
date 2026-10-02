"use client";

import React from "react";
import Link from "next/link";
import { X, Navigation, Clock, Activity, PlusCircle, ArrowRight } from "lucide-react";
import type { MapRoute } from "@/core/ui/map/routes";

export interface RouteDetailsProps {
  route: MapRoute | null;
  onClose: () => void;
  onAddToTrip?: (route: MapRoute) => void;
  className?: string;
}

export function RouteDetails({
  route,
  onClose,
  onAddToTrip,
  className = "",
}: RouteDetailsProps) {
  if (!route) return null;

  const distanceKm = route.distanceMeters ? (route.distanceMeters / 1000).toFixed(1) : undefined;
  const durationText = route.durationMinutes
    ? `${Math.floor(route.durationMinutes / 60)}h ${route.durationMinutes % 60}m`
    : undefined;

  return (
    <div
      role="region"
      aria-label={`${route.title} route details`}
      className={`fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:left-4 sm:top-24 z-[1000] w-full sm:w-80 rounded-t-3xl sm:rounded-2xl border border-neutral-200/90 bg-white/98 p-4 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/98 animate-in slide-in-from-bottom sm:slide-in-from-left duration-200 ${className}`}
    >
      <div className="flex items-start justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-tribal-terracotta/10 text-tribal-terracotta">
              <Navigation className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-tribal-terracotta">
              Tourism Corridor
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {route.title}
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close route details"
          className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Metrics */}
      <div className="my-3 grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-2 text-center dark:bg-neutral-800/60">
        {distanceKm && (
          <div>
            <span className="block text-xs font-bold text-foreground">{distanceKm} km</span>
            <span className="text-[10px] text-muted-foreground">Distance</span>
          </div>
        )}
        {durationText && (
          <div>
            <span className="block text-xs font-bold text-foreground">{durationText}</span>
            <span className="text-[10px] text-muted-foreground">Duration</span>
          </div>
        )}
        <div>
          <span className="block text-xs font-bold capitalize text-foreground">
            {route.difficulty || "Scenic"}
          </span>
          <span className="text-[10px] text-muted-foreground">Level</span>
        </div>
      </div>

      {/* Stops Timeline */}
      {route.stops && route.stops.length > 0 && (
        <div className="mb-3">
          <span className="block text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground mb-2">
            Stops & Waypoints ({route.stops.length})
          </span>
          <div className="space-y-1.5 pl-1.5 border-l-2 border-dashed border-tribal-terracotta/40">
            {route.stops.map((stop, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 -ml-[9px] rounded-full bg-tribal-terracotta" />
                <span className="font-medium text-foreground">{stop}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
        <Link
          href={`/corridors/${route.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-emerald px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-forest-emerald/90 transition-colors"
        >
          <span>Corridor Guide</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        {onAddToTrip && (
          <button
            type="button"
            onClick={() => onAddToTrip(route)}
            aria-label="Add corridor to trip"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-300 bg-white text-foreground hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
          >
            <PlusCircle className="h-4 w-4 text-forest-emerald" />
          </button>
        )}
      </div>
    </div>
  );
}
