import React from "react";
import { Sparkles, Accessibility } from "lucide-react";

interface TripPreferencesProps {
  selectedCategories: string[];
  accessibilityRequired: boolean;
  onCategoriesChange: (categories: string[]) => void;
  onAccessibilityChange: (accessibility: boolean) => void;
}

const CATEGORIES = [
  { id: "nature", label: "Nature & Waterfalls" },
  { id: "heritage", label: "Heritage & Temples" },
  { id: "tribal-culture", label: "Tribal Culture & Craft" },
  { id: "wildlife", label: "Wildlife & Forests" },
  { id: "adventure", label: "Caves & Trekking" },
  { id: "spiritual", label: "Pilgrimage & Sacred" },
];

export function TripPreferences({
  selectedCategories,
  accessibilityRequired,
  onCategoriesChange,
  onAccessibilityChange,
}: TripPreferencesProps) {
  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== id));
    } else {
      onCategoriesChange([...selectedCategories, id]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
        <Sparkles className="w-5 h-5" />
        <span>Interests & Inclusivity</span>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
          Select Your Interests
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border ${
                  isSelected
                    ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
            <Accessibility className="w-4 h-4" />
          </span>
          <div>
            <span className="text-sm font-bold text-stone-800 block">Wheelchair / Accessible Route</span>
            <span className="text-xs text-stone-500">Only recommend destinations with verified level pathways</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAccessibilityChange(!accessibilityRequired)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            accessibilityRequired ? "bg-emerald-600" : "bg-stone-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              accessibilityRequired ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
