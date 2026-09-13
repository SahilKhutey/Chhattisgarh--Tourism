"use client";

import React from "react";
import Link from "next/link";
import { Compass, AlertCircle, ArrowLeft, ShieldCheck } from "lucide-react";
import { TripBuilder } from "@/features/planning/components/TripBuilder";
import { ItineraryTimeline } from "@/features/planning/components/ItineraryTimeline";
import { useTrip } from "@/features/planning/hooks/useTrip";

export default function PlannerPage() {
  const {
    trip,
    activeItinerary,
    explanation,
    isLoading,
    error,
    startPlanning,
    handleRegenerateDay,
    reset,
  } = useTrip();

  return (
    <div className="min-h-screen bg-[#faf8f5] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <Link href="/" className="hover:text-stone-800 transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/explore" className="hover:text-stone-800 transition-colors">
              Explore
            </Link>
            <span>/</span>
            <span className="text-emerald-800 font-bold">Trip Planner</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-emerald-50 text-emerald-800 font-semibold px-3 py-1 rounded-full border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Deterministic Grounded Planner</span>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">Unable to generate itinerary</h4>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* State: Active Generated Itinerary vs Builder Form */}
        {activeItinerary ? (
          <ItineraryTimeline
            itinerary={activeItinerary}
            tripTitle={trip?.title || "My Chhattisgarh Itinerary"}
            explanation={explanation}
            onReset={reset}
            onRegenerateDay={handleRegenerateDay}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left intro column */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-xs font-bold tracking-wide">
                <Compass className="w-3.5 h-3.5" />
                <span>CG Tourism OS · Intelligent Route Engine</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
                Craft your journey across uncharted Chhattisgarh.
              </h1>

              <p className="text-sm leading-relaxed text-stone-600 font-medium">
                Our engine sequences actual verified destinations, applies realistic road factors (1.25x), respects your budget, and prevents impossible travel schedules. No synthetic heuristics or AI hallucinations.
              </p>

              <div className="bg-white rounded-2xl border border-stone-200 p-5 space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2 font-bold text-stone-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Verified Canonical Places Only</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-stone-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Dynamic Geographic Clustering & Road Estimator</span>
                </div>
                <div className="flex items-center gap-2 font-bold text-stone-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  <span>Explainable Stop Justification</span>
                </div>
              </div>
            </div>

            {/* Right form column */}
            <div className="lg:col-span-7">
              <TripBuilder onGenerate={startPlanning} isLoading={isLoading} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
