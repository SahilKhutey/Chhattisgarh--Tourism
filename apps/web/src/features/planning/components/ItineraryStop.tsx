import React from "react";
import { Clock, Car, Lock, Unlock, HelpCircle, MapPin, IndianRupee } from "lucide-react";
import { ApiItineraryStop } from "../api/itinerary-api";

interface ItineraryStopProps {
  stop: ApiItineraryStop;
  isFirst: boolean;
  onToggleLock?: (stopId: string) => void;
}

export function ItineraryStop({ stop, isFirst, onToggleLock }: ItineraryStopProps) {
  return (
    <div className="relative pl-8 pb-8 last:pb-0 group">
      {/* Timeline line */}
      <div className="absolute left-3.5 top-8 bottom-0 w-0.5 bg-emerald-100 group-last:hidden" />

      {/* Sequence dot */}
      <div className="absolute left-0 top-1.5 w-7 h-7 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center shadow-sm border-2 border-white">
        {stop.sequence}
      </div>

      {/* Travel from previous indicator */}
      {!isFirst && stop.travelFromPreviousMin !== undefined && stop.travelFromPreviousMin > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-3 bg-stone-100/80 px-2.5 py-1 rounded-md w-fit">
          <Car className="w-3.5 h-3.5 text-emerald-700" />
          <span>Estimated ~{stop.travelFromPreviousMin} mins travel from previous stop</span>
        </div>
      )}

      {/* Stop Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm hover:border-emerald-300 transition-all">
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {stop.place.category?.name || "Attraction"}
              </span>
              {stop.place.district && (
                <span className="text-xs text-stone-500 flex items-center gap-0.5">
                  <MapPin className="w-3 h-3" />
                  {stop.place.district}
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-stone-900 group-hover:text-emerald-800 transition-colors">
              {stop.place.name}
            </h4>
          </div>

          {onToggleLock && (
            <button
              type="button"
              onClick={() => onToggleLock(stop.id)}
              title={stop.isLocked ? "Unlock stop for regeneration" : "Lock stop during regeneration"}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                stop.isLocked
                  ? "bg-amber-50 text-amber-800 border-amber-300 font-bold"
                  : "bg-stone-50 text-stone-400 border-stone-200 hover:text-stone-600"
              }`}
            >
              {stop.isLocked ? <Lock className="w-3.5 h-3.5 text-amber-600" /> : <Unlock className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{stop.isLocked ? "Locked" : "Lock"}</span>
            </button>
          )}
        </div>

        {/* Schedule & Duration Telemetry */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600 py-2.5 my-2 border-y border-stone-100">
          <div className="flex items-center gap-1 font-semibold text-emerald-900">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>{stop.arrivalTime || "09:00"} – {stop.departureTime || "11:00"}</span>
          </div>

          <span className="text-stone-300">•</span>

          <div>
            <span>Visit: </span>
            <span className="font-semibold text-stone-800">{stop.visitDurationMin || 90} mins</span>
          </div>

          {stop.estimatedCost !== undefined && stop.estimatedCost > 0 && (
            <>
              <span className="text-stone-300">•</span>
              <div className="flex items-center gap-0.5 font-semibold text-stone-800">
                <IndianRupee className="w-3 h-3 text-stone-500" />
                <span>~{stop.estimatedCost}</span>
              </div>
            </>
          )}
        </div>

        {/* Explainability Callout */}
        {stop.reason && (
          <div className="mt-2.5 flex items-start gap-2 bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100/60 text-xs text-emerald-900">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div className="leading-relaxed">
              <span className="font-bold text-emerald-950">Why this place? </span>
              <span>{stop.reason}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
