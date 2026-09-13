import React from "react";
import { Calendar } from "lucide-react";

interface DateSelectorProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export function DateSelector({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateSelectorProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4 text-emerald-800 font-semibold">
        <Calendar className="w-5 h-5" />
        <span>Travel Dates</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 p-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full rounded-xl border border-stone-300 p-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex justify-between items-center text-sm">
        <span className="text-stone-500">Trip Duration:</span>
        <span className="font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          {days} {days === 1 ? "Day" : "Days"}
        </span>
      </div>
    </div>
  );
}
