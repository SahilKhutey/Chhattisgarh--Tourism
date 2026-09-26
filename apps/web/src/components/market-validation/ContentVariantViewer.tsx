import React, { useState } from "react";

export interface ContentEntryViewerData {
  title: string;
  category: string;
  short_description: string;
  long_description?: string;
  fields_json?: {
    practical?: {
      opening_hours?: string;
      fees?: string;
      best_time?: string;
      duration?: string;
    };
    cultural?: {
      history?: string;
      local_story?: string;
      traditions?: string;
    };
    geography?: {
      district?: string;
      nearby_places?: string[];
      routes?: string[];
    };
    trust?: {
      official_reference?: string;
      last_verified?: string;
    };
  };
}

export interface ContentVariantViewerProps {
  content: ContentEntryViewerData;
  onOpenSection?: (section: string) => void;
  onSave?: () => void;
  onStartItinerary?: () => void;
}

export function ContentVariantViewer({
  content,
  onOpenSection,
  onSave,
  onStartItinerary,
}: ContentVariantViewerProps) {
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "PRACTICAL" | "CULTURE" | "GEOGRAPHY">("OVERVIEW");
  const [saved, setSaved] = useState(false);

  const handleTabClick = (tab: "OVERVIEW" | "PRACTICAL" | "CULTURE" | "GEOGRAPHY") => {
    setActiveTab(tab);
    if (onOpenSection) onOpenSection(tab.toLowerCase());
  };

  const handleSave = () => {
    setSaved(!saved);
    if (onSave) onSave();
  };

  const prac = content.fields_json?.practical;
  const cult = content.fields_json?.cultural;
  const geo = content.fields_json?.geography;
  const trust = content.fields_json?.trust;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2 py-0.5 rounded font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {content.category}
            </span>
            {geo?.district && <span className="text-xs text-slate-500">{geo.district} District</span>}
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1">{content.title}</h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleSave}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              saved
                ? "bg-amber-50 text-amber-800 border-amber-300"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            }`}
          >
            {saved ? "★ Saved to Trip" : "☆ Save Destination"}
          </button>
          {onStartItinerary && (
            <button
              type="button"
              onClick={onStartItinerary}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-xs"
            >
              Add to Itinerary
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-slate-200 text-xs font-semibold">
        {(["OVERVIEW", "PRACTICAL", "CULTURE", "GEOGRAPHY"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabClick(tab)}
            className={`px-3 py-2 border-b-2 transition-colors ${
              activeTab === tab
                ? "border-emerald-600 text-emerald-800 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab === "OVERVIEW" && "Overview"}
            {tab === "PRACTICAL" && "Practical Info"}
            {tab === "CULTURE" && "Cultural Significance"}
            {tab === "GEOGRAPHY" && "Nearby & Routes"}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === "OVERVIEW" && (
        <div className="space-y-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900 leading-relaxed">{content.short_description}</p>
          {content.long_description && <p className="text-slate-600 leading-relaxed">{content.long_description}</p>}

          {trust?.official_reference && (
            <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-md text-xs text-blue-900 flex items-center justify-between">
              <span>✓ Information Verified via {trust.official_reference}</span>
              <span className="font-mono text-[11px] text-blue-700">Audit Verified</span>
            </div>
          )}
        </div>
      )}

      {activeTab === "PRACTICAL" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Opening Hours
            </span>
            <span className="font-bold text-slate-800 text-sm">{prac?.opening_hours || "Sunrise to Sunset"}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Entry & Activity Fees
            </span>
            <span className="font-bold text-slate-800 text-sm">{prac?.fees || "Free Public Access"}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Best Time to Visit
            </span>
            <span className="font-bold text-slate-800 text-sm">{prac?.best_time || "Monsoon & Post-Monsoon"}</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Recommended Duration
            </span>
            <span className="font-bold text-slate-800 text-sm">{prac?.duration || "2 - 3 Hours"}</span>
          </div>
        </div>
      )}

      {activeTab === "CULTURE" && (
        <div className="space-y-3 text-xs">
          {cult?.local_story && (
            <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-md">
              <span className="text-amber-800 font-bold uppercase tracking-wider block mb-1">
                Local Folklore & Oral Tradition
              </span>
              <p className="text-slate-700 text-sm leading-relaxed">{cult.local_story}</p>
            </div>
          )}

          {cult?.history && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                Historical Context
              </span>
              <p className="text-slate-700">{cult.history}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "GEOGRAPHY" && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
            <span className="text-slate-500 font-semibold uppercase tracking-wider block mb-1.5">
              Nearby Contextual Places
            </span>
            <div className="flex flex-wrap gap-1.5">
              {geo?.nearby_places && geo.nearby_places.length > 0 ? (
                geo.nearby_places.map((place, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800">
                    {place}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">Within 25km cluster</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
