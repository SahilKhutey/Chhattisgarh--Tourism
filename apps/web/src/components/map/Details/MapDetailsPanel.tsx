"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { X, MapPin, ExternalLink, PlusCircle, Compass, Star, Clock } from "lucide-react";
import type { MapDetailsModel } from "@/core/ui/map/details";

export interface MapDetailsPanelProps {
  details: MapDetailsModel | null;
  onClose: () => void;
  onAction?: (actionId: string, details: MapDetailsModel) => void;
  className?: string;
}

export function MapDetailsPanel({
  details,
  onClose,
  onAction,
  className = "",
}: MapDetailsPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && details) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [details, onClose]);

  if (!details) return null;

  return (
    <aside
      ref={panelRef}
      role="dialog"
      aria-label={`${details.title} geographic details`}
      aria-modal="false"
      className={`fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:right-4 sm:top-4 z-[1000] w-full sm:w-96 max-h-[85vh] sm:max-h-[calc(100%-2rem)] flex flex-col rounded-t-3xl sm:rounded-2xl border border-neutral-200/90 bg-white/98 shadow-2xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/98 overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200 ${className}`}
    >
      {/* Mobile drag handle indicator */}
      <div className="sm:hidden flex justify-center pt-2 pb-1">
        <div className="h-1.5 w-12 rounded-full bg-neutral-300 dark:bg-neutral-700" />
      </div>

      {/* Header with Close */}
      <div className="relative">
        {details.imageUrl ? (
          <div className="relative h-44 w-full overflow-hidden bg-neutral-100">
            <img
              src={details.imageUrl}
              alt={details.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 left-4 right-4">
              <span className="inline-block rounded bg-forest-emerald px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                {details.category || "Destination"}
              </span>
              <h3 className="mt-1 text-lg font-bold text-white leading-tight">
                {details.title}
              </h3>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between border-b border-neutral-100 p-4 pb-3 dark:border-neutral-800">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-emerald bg-forest-emerald/10 px-2 py-0.5 rounded">
                {details.category || "Destination"}
              </span>
              <h3 className="mt-1 text-base font-bold text-foreground">
                {details.title}
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Subtitle & Coordinates */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-neutral-100 pb-2 dark:border-neutral-800">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-forest-emerald shrink-0" />
            <span>{details.subtitle || `${details.district || "Chhattisgarh"} District`}</span>
          </div>
          <span className="font-mono text-[11px]">
            {details.coordinates.latitude.toFixed(4)}°N, {details.coordinates.longitude.toFixed(4)}°E
          </span>
        </div>

        {/* Summary */}
        {details.summary && (
          <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
            {details.summary}
          </p>
        )}

        {/* Highlights */}
        {details.highlights && details.highlights.length > 0 && (
          <div>
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-foreground mb-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" /> Key Highlights
            </h4>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {details.highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-forest-emerald font-bold">·</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Visiting Info */}
        {details.visitingInfo && (
          <div className="rounded-xl bg-neutral-50 p-2.5 dark:bg-neutral-800/60">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-foreground mb-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" /> Visiting Information
            </h4>
            <p className="text-[11px] text-muted-foreground">{details.visitingInfo}</p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="border-t border-neutral-100 p-3 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50 flex items-center gap-2">
        {details.actions.map((act) => {
          if (act.href) {
            return (
              <Link
                key={act.id}
                href={act.href}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-forest-emerald px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-forest-emerald/90 transition-colors"
              >
                <span>{act.label}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            );
          }

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onAction && onAction(act.action || act.id, details)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-foreground shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-colors"
            >
              <PlusCircle className="h-3.5 w-3.5 text-forest-emerald" />
              <span>{act.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
