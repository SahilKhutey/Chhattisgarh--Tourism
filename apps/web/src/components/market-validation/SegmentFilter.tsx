import React from "react";

export const CONSUMER_SEGMENTS = [
  { id: "ALL", label: "All Segments" },
  { id: "LOCAL_RESIDENT", label: "Local Resident" },
  { id: "CG_TRAVELER", label: "Intra-State CG Traveler" },
  { id: "INTERSTATE_TRAVELER", label: "Interstate Domestic Traveler" },
  { id: "INTERNATIONAL_TRAVELER", label: "International Traveler" },
  { id: "SOLO_TRAVELER", label: "Solo Traveler" },
  { id: "COUPLE", label: "Couple" },
  { id: "FAMILY", label: "Family" },
  { id: "GROUP", label: "Group / Alumni" },
  { id: "BACKPACKER", label: "Backpacker" },
  { id: "ADVENTURE_TRAVELER", label: "Adventure / Trekking" },
  { id: "CULTURAL_TRAVELER", label: "Cultural / Heritage" },
  { id: "NATURE_TRAVELER", label: "Nature / Waterfalls" },
  { id: "PILGRIMAGE_TRAVELER", label: "Pilgrimage / Spiritual" },
  { id: "WILDLIFE_TRAVELER", label: "Wildlife / Eco-Sanctuary" },
];

interface SegmentFilterProps {
  selectedSegment: string;
  onChange: (segment: string) => void;
}

export function SegmentFilter({ selectedSegment, onChange }: SegmentFilterProps) {
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      <span className="text-xs text-slate-400 font-medium mr-1">Filter Segment:</span>
      {CONSUMER_SEGMENTS.slice(0, 8).map((seg) => {
        const isSelected = (selectedSegment || "ALL") === seg.id;
        return (
          <button
            key={seg.id}
            type="button"
            onClick={() => onChange(seg.id === "ALL" ? "" : seg.id)}
            className={`px-3 py-1 text-xs rounded-lg border transition-all ${
              isSelected
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40 font-semibold"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {seg.label}
          </button>
        );
      })}
    </div>
  );
}
