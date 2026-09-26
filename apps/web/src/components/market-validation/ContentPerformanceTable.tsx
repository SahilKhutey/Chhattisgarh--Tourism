import React, { useState } from "react";

export interface ContentPerformanceItem {
  content_id: string;
  title: string;
  destination_name?: string;
  cohort: string;
  quality_score: number;
  impressions: number;
  opens: number;
  engaged_sessions: number;
  saves: number;
  shares: number;
  second_destination_views: number;
  itinerary_starts: number;
  planning_activation_rate: number;
  discovery_score: number;
}

export interface ContentPerformanceTableProps {
  items: ContentPerformanceItem[];
  isLoading?: boolean;
}

export function ContentPerformanceTable({ items, isLoading }: ContentPerformanceTableProps) {
  const [filterCohort, setFilterCohort] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<keyof ContentPerformanceItem>("discovery_score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const cohorts = ["ALL", ...Array.from(new Set(items.map((i) => i.cohort)))];

  const filtered = items.filter((item) => {
    if (filterCohort !== "ALL" && item.cohort !== filterCohort) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const valA = a[sortBy];
    const valB = b[sortBy];
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (field: keyof ContentPerformanceItem) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden space-y-3 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Cohort Analytics • Behavioral Engagement
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">Content Performance Matrix</h4>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-slate-500">Cohort:</label>
          <select
            value={filterCohort}
            onChange={(e) => setFilterCohort(e.target.value)}
            className="text-xs border border-slate-200 rounded px-2.5 py-1 bg-slate-50 text-slate-700 font-medium"
          >
            {cohorts.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-sm text-slate-400">Loading performance data...</div>
      ) : sorted.length === 0 ? (
        <div className="p-8 text-center text-sm text-slate-400">No content performance records found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono text-[11px] uppercase tracking-wider">
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("title")}
                >
                  Content / Destination
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("cohort")}
                >
                  Cohort
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("quality_score")}
                >
                  Quality
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("impressions")}
                >
                  Impr
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("opens")}
                >
                  Opens
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("engaged_sessions")}
                >
                  Engaged
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("saves")}
                >
                  Saves
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("second_destination_views")}
                >
                  Next Dest
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("itinerary_starts")}
                >
                  Itin Starts
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("planning_activation_rate")}
                >
                  Activation
                </th>
                <th
                  className="py-2.5 px-3 text-right cursor-pointer hover:text-slate-900"
                  onClick={() => handleSort("discovery_score")}
                >
                  Disc Score
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.map((item) => (
                <tr key={item.content_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-slate-900 block truncate max-w-[200px]" title={item.title}>
                      {item.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.destination_name || item.content_id}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.cohort}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span
                      className={`font-mono font-bold ${
                        item.quality_score >= 75
                          ? "text-emerald-600"
                          : item.quality_score >= 50
                          ? "text-amber-600"
                          : "text-red-500"
                      }`}
                    >
                      {item.quality_score.toFixed(0)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-medium text-slate-800">
                    {item.opens.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.engaged_sessions.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.saves.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                    {item.second_destination_views.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600">
                    {item.itinerary_starts.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="font-mono font-semibold text-slate-800">
                      {(item.planning_activation_rate * 100).toFixed(1)}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-100 text-slate-900 border border-slate-200">
                      {item.discovery_score.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
