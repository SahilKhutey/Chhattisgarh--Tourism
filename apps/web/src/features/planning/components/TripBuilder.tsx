import React, { useState } from "react";
import { Sparkles, ArrowRight, Loader2, MapPin } from "lucide-react";
import { DateSelector } from "./DateSelector";
import { PaceSelector, TripPace } from "./PaceSelector";
import { BudgetInput } from "./BudgetInput";
import { TripPreferences } from "./TripPreferences";
import { CreateTripPayload } from "../api/itinerary-api";

interface TripBuilderProps {
  onGenerate: (payload: CreateTripPayload) => Promise<void>;
  isLoading: boolean;
}

export function TripBuilder({ onGenerate, isLoading }: TripBuilderProps) {
  const [title, setTitle] = useState("My Chhattisgarh Journey");
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split("T")[0];
  });
  const [travelers, setTravelers] = useState(2);
  const [pace, setPace] = useState<TripPace>("BALANCED");
  const [budgetAmount, setBudgetAmount] = useState<number | undefined>(15000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["nature", "heritage"]);
  const [accessibilityRequired, setAccessibilityRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onGenerate({
      title,
      startDate,
      endDate,
      travelers,
      pace,
      budgetAmount,
      categories: selectedCategories,
      accessibilityRequired,
      originLatitude: 21.2514,
      originLongitude: 81.6296,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Trip Title */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Trip Name
        </label>
        <div className="relative">
          <MapPin className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Bastar Heartland Expedition"
            className="w-full rounded-xl border border-stone-300 p-3 pl-10 text-stone-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-base"
            required
          />
        </div>
      </div>

      <DateSelector
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />

      <PaceSelector pace={pace} onChange={setPace} />

      <BudgetInput
        budgetAmount={budgetAmount}
        travelers={travelers}
        onChange={setBudgetAmount}
        onTravelersChange={setTravelers}
      />

      <TripPreferences
        selectedCategories={selectedCategories}
        accessibilityRequired={accessibilityRequired}
        onCategoriesChange={setSelectedCategories}
        onAccessibilityChange={setAccessibilityRequired}
      />

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-base shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-3 transition-all disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Generating Deterministic Itinerary...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            <span>Generate Real Itinerary</span>
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </form>
  );
}
