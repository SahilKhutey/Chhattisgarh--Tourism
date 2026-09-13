import React from "react";
import { IndianRupee } from "lucide-react";

interface BudgetInputProps {
  budgetAmount?: number;
  travelers: number;
  onChange: (budget?: number) => void;
  onTravelersChange: (travelers: number) => void;
}

export function BudgetInput({
  budgetAmount,
  travelers,
  onChange,
  onTravelersChange,
}: BudgetInputProps) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
        <IndianRupee className="w-5 h-5" />
        <span>Budget & Group</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Number of Travelers
          </label>
          <select
            value={travelers}
            onChange={(e) => onTravelersChange(Number(e.target.value))}
            className="w-full rounded-xl border border-stone-300 p-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "Traveler (Solo)" : `${num} Travelers`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Approximate Total Budget (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
            <input
              type="number"
              placeholder="e.g. 10000"
              value={budgetAmount || ""}
              onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
              min={1000}
              step={500}
              className="w-full rounded-xl border border-stone-300 p-3 pl-8 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
            />
          </div>
          {budgetAmount && (
            <p className="text-[11px] text-stone-500 mt-1">
              ~₹{Math.round(budgetAmount / travelers).toLocaleString("en-IN")} per person
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
