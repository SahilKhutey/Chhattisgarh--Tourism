"use client";

import React, { useEffect, useState } from "react";
import { RetentionInsights, FailureReasonItem, SeasonalityItem } from "@/components/market-validation/RetentionInsights";

export default function RetentionAnalysisAdminPage() {
  const [failures, setFailures] = useState<FailureReasonItem[]>([
    { cause: "USER_COMPLETED_NEED", count: 42, percentage: 35.0 },
    { cause: "SEASONALITY", count: 28, percentage: 23.3 },
    { cause: "NO_RELEVANT_DESTINATION", count: 18, percentage: 15.0 },
    { cause: "CONTENT_GAP", count: 12, percentage: 10.0 },
    { cause: "LOW_REGIONAL_COVERAGE", count: 11, percentage: 9.2 },
    { cause: "BOOKING_FAILURE", count: 5, percentage: 4.2 },
  ]);
  const [seasonality, setSeasonality] = useState<SeasonalityItem[]>([
    { season_name: "Dussehra Festival", cohort_count: 320, trip_cycle_retention_rate: 0.34, next_trip_rate: 0.28, seasonality_adjustment_factor: 1.25 },
    { season_name: "Winter Peak (Nov-Feb)", cohort_count: 480, trip_cycle_retention_rate: 0.29, next_trip_rate: 0.24, seasonality_adjustment_factor: 1.15 },
    { season_name: "Monsoon (Jul-Sep)", cohort_count: 210, trip_cycle_retention_rate: 0.22, next_trip_rate: 0.17, seasonality_adjustment_factor: 0.90 },
    { season_name: "Summer (Apr-Jun)", cohort_count: 140, trip_cycle_retention_rate: 0.14, next_trip_rate: 0.11, seasonality_adjustment_factor: 0.75 },
  ]);
  const [decision, setDecision] = useState("SUPPORTED");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/analysis/macro", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.failure_causes_breakdown) {
          setFailures(data.failure_causes_breakdown);
        }
        if (data.seasonality_cohorts) {
          setSeasonality(data.seasonality_cohorts);
        }
        if (data.retention_decision) {
          setDecision(data.retention_decision);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Macro Synthesis • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Retention Analysis &amp; Decision Synthesis
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Macro diagnosis of episodic tourism return rates, seasonality impacts, and network sustainability.
        </p>
      </div>

      <RetentionInsights
        failures={failures}
        seasonality={seasonality}
        retentionDecision={decision}
      />
    </div>
  );
}
