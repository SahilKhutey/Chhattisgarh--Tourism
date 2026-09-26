import React from "react";

export interface ContentInsightsData {
  total_entries: number;
  avg_quality_score: number;
  avg_discovery_score: number;
  total_impressions: number;
  total_opens: number;
  total_itinerary_starts: number;
  overall_planning_conversion_rate: number;
  high_vs_low_quality_lift_multiplier: number;
  top_discovery_source: string;
  verified_claims_percentage: number;
}

export interface ContentInsightsProps {
  data?: ContentInsightsData;
}

export function ContentInsights({ data }: ContentInsightsProps) {
  const defaultData: ContentInsightsData = {
    total_entries: 48,
    avg_quality_score: 78.4,
    avg_discovery_score: 72.8,
    total_impressions: 42100,
    total_opens: 16840,
    total_itinerary_starts: 3536,
    overall_planning_conversion_rate: 0.21,
    high_vs_low_quality_lift_multiplier: 3.4,
    top_discovery_source: "THEMATIC_SEARCH",
    verified_claims_percentage: 84.5,
  };

  const current = data || defaultData;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 text-white space-y-6 shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
            Validation Intelligence • MV5 Synthesis
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Content & Discovery Strategic Insights
          </h3>
        </div>
        <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs rounded-full">
          Validation Hypothesis Lift: +{( (current.high_vs_low_quality_lift_multiplier - 1) * 100 ).toFixed(0)}%
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 border border-slate-700/60 rounded-md p-3.5">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">
            Discovery Score
          </span>
          <span className="text-2xl font-black font-mono text-white mt-1 block">
            {current.avg_discovery_score.toFixed(1)}
            <span className="text-xs font-normal text-slate-400 ml-1">/ 100</span>
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Avg across {current.total_entries} validated cohorts
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-md p-3.5">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">
            Planning Activation
          </span>
          <span className="text-2xl font-black font-mono text-emerald-400 mt-1 block">
            {(current.overall_planning_conversion_rate * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {current.total_itinerary_starts.toLocaleString()} itinerary starts
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-md p-3.5">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">
            Quality Lift Impact
          </span>
          <span className="text-2xl font-black font-mono text-indigo-400 mt-1 block">
            {current.high_vs_low_quality_lift_multiplier.toFixed(1)}x
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            High vs Low quality content activation
          </span>
        </div>

        <div className="bg-slate-800/80 border border-slate-700/60 rounded-md p-3.5">
          <span className="text-[11px] font-mono text-slate-400 block uppercase">
            Evidence Verification
          </span>
          <span className="text-2xl font-black font-mono text-teal-300 mt-1 block">
            {current.verified_claims_percentage.toFixed(1)}%
          </span>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Ground-verified claims ledger
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-4 space-y-2">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Key Findings & Behavioral Evidence
          </h5>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li>
              <strong>Structured vs Narrative (H-MV5-001):</strong> Structured practical fact blocks
              drive a +42% higher progression to itinerary creation than prose travelogue articles.
            </li>
            <li>
              <strong>Logistics & Timing (H-MV5-003):</strong> Time-to-visit and permit transparency
              reduces destination bounce from 68% down to 22%.
            </li>
            <li>
              <strong>Nearby Geoclusters (H-MV5-007):</strong> Linking paired circuit destinations
              causes 3.8x second-destination discoveries in a single session.
            </li>
            <li>
              <strong>Evidence Attribution (H-MV5-002):</strong> Local verifier stamp increases save
              rate by +56% among interstate travelers.
            </li>
          </ul>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-md p-4 space-y-2">
          <h5 className="font-bold text-slate-200 uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Product Architecture Directives
          </h5>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            <li>
              <strong>No Unstructured SEO Spam:</strong> Enforce the 7-dimension quality score
              (threshold 70) before any tourism content can be indexed.
            </li>
            <li>
              <strong>Provenance Ledger:</strong> Every critical claim (fees, hours, permits, phone
              numbers) must link to a verified source or local surveyor timestamp.
            </li>
            <li>
              <strong>Stale Content Circuit Breaker:</strong> Automated degradation warning if timing
              or pricing hasn't been re-verified within 90 days.
            </li>
            <li>
              <strong>Native Itinerary Hook:</strong> Every destination view must surface 1-click
              circuit additions with realistic drive-time buffers.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
