import React from "react";
import { Calendar, RotateCcw, Clock, Navigation } from "lucide-react";
import { ApiItineraryDay } from "../api/itinerary-api";
import { ItineraryStop } from "./ItineraryStop";

interface ItineraryDayProps {
  day: ApiItineraryDay;
  onRegenerateDay?: (daySequence: number) => void;
  onToggleLock?: (stopId: string) => void;
}

export function ItineraryDay({ day, onRegenerateDay, onToggleLock }: ItineraryDayProps) {
  const formattedDate = new Date(day.date).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="bg-stone-50/70 rounded-3xl border border-stone-200/80 p-6 shadow-sm">
      {/* Day Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white flex flex-col items-center justify-center shadow-md shadow-emerald-950/20">
            <span className="text-[10px] font-bold uppercase tracking-wider">Day</span>
            <span className="text-lg font-black leading-none">{day.sequence}</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <span>Day {day.sequence} Schedule</span>
              <span className="text-xs font-normal text-stone-500 bg-white px-2.5 py-0.5 rounded-full border border-stone-200">
                {formattedDate}
              </span>
            </h3>
            <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                {day.startTime || "09:00"} – {day.endTime || "18:00"}
              </span>
              {day.distanceKm !== undefined && day.distanceKm > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5 text-stone-400" />
                    ~{day.distanceKm} km route
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {onRegenerateDay && (
          <button
            type="button"
            onClick={() => onRegenerateDay(day.sequence)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 transition-all flex items-center gap-1.5 shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
            <span>Regenerate Day {day.sequence}</span>
          </button>
        )}
      </div>

      {/* Stops list */}
      <div className="space-y-2">
        {day.stops.length === 0 ? (
          <div className="text-center py-8 text-stone-400 text-sm italic">
            No stops scheduled for this day
          </div>
        ) : (
          day.stops.map((stop, idx) => (
            <ItineraryStop
              key={stop.id}
              stop={stop}
              isFirst={idx === 0}
              onToggleLock={onToggleLock}
            />
          ))
        )}
      </div>
    </div>
  );
}
