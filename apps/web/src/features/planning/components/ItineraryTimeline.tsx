"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Sparkles, MessageSquare, ArrowLeft } from "lucide-react";
import { ApiItinerary } from "../api/itinerary-api";
import { PlanningSummary } from "./PlanningSummary";
import { ItineraryDay } from "./ItineraryDay";

// Dynamic import for Leaflet map to avoid SSR window errors
const PlanningMap = dynamic(
  () => import("./PlanningMap").then((mod) => mod.PlanningMap),
  { ssr: false, loading: () => <div className="h-[520px] bg-stone-100 animate-pulse rounded-3xl" /> },
);

interface ItineraryTimelineProps {
  itinerary: ApiItinerary;
  tripTitle: string;
  explanation?: string;
  onReset: () => void;
  onRegenerateDay?: (daySequence: number) => void;
  onToggleLock?: (stopId: string) => void;
}

export function ItineraryTimeline({
  itinerary,
  tripTitle,
  explanation,
  onReset,
  onRegenerateDay,
  onToggleLock,
}: ItineraryTimelineProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Trip Parameters</span>
        </button>
      </div>

      <PlanningSummary itinerary={itinerary} title={tripTitle} />

      {explanation && (
        <div className="mb-8 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 text-emerald-950 shadow-sm flex items-start gap-3">
          <MessageSquare className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm mb-1 text-emerald-900">Trip Overview & Feasibility Rationale</h4>
            <p className="text-xs leading-relaxed text-emerald-800 whitespace-pre-line font-medium">
              {explanation}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Days List */}
        <div className="lg:col-span-7 space-y-6">
          {itinerary.days.map((day) => (
            <ItineraryDay
              key={day.id}
              day={day}
              onRegenerateDay={onRegenerateDay}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>

        {/* Map column */}
        <div className="lg:col-span-5">
          <div className="sticky top-24">
            <PlanningMap itinerary={itinerary} />
          </div>
        </div>
      </div>
    </div>
  );
}
