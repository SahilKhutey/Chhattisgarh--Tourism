import React from "react";
import { Navigation, Clock, MapPin, IndianRupee, Sparkles } from "lucide-react";
import { ApiItinerary } from "../api/itinerary-api";

interface PlanningSummaryProps {
  itinerary: ApiItinerary;
  title: string;
}

export function PlanningSummary({ itinerary, title }: PlanningSummaryProps) {
  const totalStops = itinerary.days.reduce((acc, d) => acc + d.stops.length, 0);
  const totalHours = Math.round(itinerary.totalDurationMin / 60);

  return (
    <div className="bg-gradient-to-r from-emerald-900 to-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl mb-8 relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>Active Itinerary (v{itinerary.version})</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black mb-6 tracking-tight text-white">
          {title}
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-emerald-800/60">
          <div>
            <span className="text-xs text-stone-400 block mb-1">Total Distance</span>
            <div className="flex items-center gap-1.5 font-black text-xl text-emerald-300">
              <Navigation className="w-4 h-4 text-emerald-400" />
              <span>{Math.round(itinerary.totalDistanceKm)} km</span>
            </div>
            <span className="text-[10px] text-stone-400">Road estimated</span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block mb-1">Total Duration</span>
            <div className="flex items-center gap-1.5 font-black text-xl text-stone-100">
              <Clock className="w-4 h-4 text-stone-400" />
              <span>~{totalHours} hrs</span>
            </div>
            <span className="text-[10px] text-stone-400">Travel + visits</span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block mb-1">Destinations</span>
            <div className="flex items-center gap-1.5 font-black text-xl text-stone-100">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>{totalStops} stops</span>
            </div>
            <span className="text-[10px] text-stone-400">{itinerary.days.length} days</span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block mb-1">Est. Entry/Tolls</span>
            <div className="flex items-center gap-1.5 font-black text-xl text-amber-300">
              <IndianRupee className="w-4 h-4 text-amber-400" />
              <span>₹{itinerary.estimatedCost.toLocaleString("en-IN")}</span>
            </div>
            <span className="text-[10px] text-stone-400">Per group</span>
          </div>
        </div>
      </div>
    </div>
  );
}
