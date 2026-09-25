import React, { useState } from "react";

export interface GeoRelevanceBreakdown {
  distance_score: number;
  travel_time_score: number;
  route_compatibility: number;
  experience_compatibility: number;
  destination_popularity: number;
  user_interest_match: number;
}

export interface NearbyPlaceItem {
  destination_id: string;
  destination_name: string;
  tourism_type: string;
  district: string;
  distance_km: number;
  travel_time_minutes: number;
  relationship_type: string;
  confidence: number;
  geo_relevance_score: number;
  relevance_breakdown?: GeoRelevanceBreakdown;
}

export interface NearbyPlacesPanelProps {
  sourceDestinationId: string;
  sourceDestinationName: string;
  places: NearbyPlaceItem[];
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  onSortChange?: (sort: "distance" | "relevance") => void;
  onSelectPlace?: (place: NearbyPlaceItem) => void;
}

export function NearbyPlacesPanel({
  sourceDestinationId,
  sourceDestinationName,
  places,
  radiusKm = 50,
  onRadiusChange,
  onSortChange,
  onSelectPlace,
}: NearbyPlacesPanelProps) {
  const [selectedRadius, setSelectedRadius] = useState<number>(radiusKm);
  const [sortBy, setSortBy] = useState<"distance" | "relevance">("relevance");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleRadiusClick = (r: number) => {
    setSelectedRadius(r);
    if (onRadiusChange) onRadiusChange(r);
  };

  const handleSortChange = (s: "distance" | "relevance") => {
    setSortBy(s);
    if (onSortChange) onSortChange(s);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Nearby Places from {sourceDestinationName}
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Anchor: {sourceDestinationId} | Showing {places.length} destinations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Radius Switcher */}
          <div className="inline-flex rounded-md shadow-xs" role="group">
            {[10, 25, 50, 100].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleRadiusClick(r)}
                className={`px-2.5 py-1 text-xs font-semibold border ${
                  selectedRadius === r
                    ? "bg-emerald-600 text-white border-emerald-600 z-10"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                } first:rounded-l-md last:rounded-r-md -ml-px first:ml-0 transition-colors`}
              >
                {r}km
              </button>
            ))}
          </div>

          {/* Sort Switcher */}
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as "distance" | "relevance")}
            className="text-xs border border-slate-300 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="relevance">Sort: Relevance Score</option>
            <option value="distance">Sort: Nearest Distance</option>
          </select>
        </div>
      </div>

      {/* Places List */}
      {places.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-sm">
          No destinations found within {selectedRadius}km radius.
        </div>
      ) : (
        <div className="space-y-3">
          {places.map((place) => {
            const isExpanded = expandedId === place.destination_id;
            return (
              <div
                key={place.destination_id}
                className="p-3.5 border border-slate-200 rounded-lg hover:border-emerald-300 transition-all bg-slate-50/50"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {place.destination_name}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {place.tourism_type}
                      </span>
                      <span className="text-xs text-slate-500">{place.district}</span>
                    </div>
                    <div className="text-xs text-slate-500 space-x-3">
                      <span>{place.distance_km} km away</span>
                      <span>&bull;</span>
                      <span>~{place.travel_time_minutes} mins drive</span>
                      <span>&bull;</span>
                      <span className="font-mono text-indigo-600">{place.relationship_type}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Relevance</div>
                      <div className="text-sm font-black text-emerald-600">
                        {place.geo_relevance_score}/100
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleExpand(place.destination_id)}
                      className="px-2 py-1 text-xs border border-slate-200 rounded text-slate-600 hover:bg-white"
                    >
                      {isExpanded ? "Hide Score" : "Score Breakdown"}
                    </button>

                    {onSelectPlace && (
                      <button
                        type="button"
                        onClick={() => onSelectPlace(place)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                      >
                        Select
                      </button>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Bars */}
                {isExpanded && place.relevance_breakdown && (
                  <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500">Distance Match: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.distance_score}/25
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Travel Time: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.travel_time_score}/20
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Route Fit: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.route_compatibility}/20
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Experience Fit: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.experience_compatibility}/15
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Popularity: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.destination_popularity}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">User Interest: </span>
                      <span className="font-bold text-slate-800">
                        {place.relevance_breakdown.user_interest_match}/10
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
