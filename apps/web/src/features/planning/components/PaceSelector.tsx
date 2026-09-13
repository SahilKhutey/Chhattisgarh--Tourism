import React from "react";
import { Compass, Coffee, Gauge, Zap } from "lucide-react";

export type TripPace = "RELAXED" | "BALANCED" | "FAST";

interface PaceSelectorProps {
  pace: TripPace;
  onChange: (pace: TripPace) => void;
}

const PACE_OPTIONS: {
  id: TripPace;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  stops: string;
}[] = [
  {
    id: "RELAXED",
    title: "Relaxed",
    subtitle: "Immersive & Slow Travel",
    icon: Coffee,
    stops: "1–2 stops/day · Generous rest buffers",
  },
  {
    id: "BALANCED",
    title: "Balanced",
    subtitle: "Optimal Exploration",
    icon: Compass,
    stops: "3–4 stops/day · Scenic routes & meals",
  },
  {
    id: "FAST",
    title: "Fast-Paced",
    subtitle: "See Everything",
    icon: Zap,
    stops: "4–5 stops/day · High-activity discovery",
  },
];

export function PaceSelector({ pace, onChange }: PaceSelectorProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
        <Gauge className="w-5 h-5" />
        <span>Travel Pace</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {PACE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const isSelected = pace === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/20"
                  : "border-stone-200 hover:border-stone-300 bg-stone-50/50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-lg ${isSelected ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {isSelected && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                    Selected
                  </span>
                )}
              </div>
              <h4 className="font-bold text-stone-900 text-sm">{opt.title}</h4>
              <p className="text-xs text-stone-500 mb-2">{opt.subtitle}</p>
              <p className="text-[11px] font-medium text-emerald-800 bg-white/80 p-1.5 rounded border border-emerald-100">
                {opt.stops}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
