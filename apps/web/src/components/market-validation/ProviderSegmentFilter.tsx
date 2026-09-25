import React from "react";

export interface ProviderSegmentFilterProps {
  selectedSegment: string;
  selectedGeography: string;
  onSelectSegment: (segment: string) => void;
  onSelectGeography: (geography: string) => void;
}

const SEGMENTS = [
  { id: "ALL", label: "All Segments" },
  { id: "INDIVIDUAL", label: "Individual Guide / Host" },
  { id: "MICRO_BUSINESS", label: "Micro Business (<5 staff)" },
  { id: "SMALL_BUSINESS", label: "Small Business (5-20 staff)" },
  { id: "COMMUNITY", label: "Community / Tribal Cooperative" },
  { id: "NON_PROFIT", label: "Non-Profit" },
];

const GEOGRAPHIES = [
  { id: "ALL", label: "All Regions" },
  { id: "BASTAR", label: "Bastar & Southern" },
  { id: "SURGUJA", label: "Surguja & Northern" },
  { id: "RAIPUR", label: "Raipur & Central" },
  { id: "BILASPUR", label: "Bilaspur" },
  { id: "DURG", label: "Durg & Rajnandgaon" },
];

export function ProviderSegmentFilter({
  selectedSegment,
  selectedGeography,
  onSelectSegment,
  onSelectGeography,
}: ProviderSegmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-4 p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Provider Segment
        </label>
        <select
          value={selectedSegment}
          onChange={(e) => onSelectSegment(e.target.value)}
          className="w-full text-sm border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 px-3 py-1.5"
        >
          {SEGMENTS.map((seg) => (
            <option key={seg.id} value={seg.id}>
              {seg.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 min-w-[200px]">
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
          Target Geography
        </label>
        <select
          value={selectedGeography}
          onChange={(e) => onSelectGeography(e.target.value)}
          className="w-full text-sm border-slate-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 px-3 py-1.5"
        >
          {GEOGRAPHIES.map((geo) => (
            <option key={geo.id} value={geo.id}>
              {geo.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
