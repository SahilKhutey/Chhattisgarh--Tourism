"use client";

import React, { useEffect, useState } from "react";
import { RetentionCohortTable, CohortRow } from "@/components/market-validation/RetentionCohortTable";

export default function CohortsAdminPage() {
  const [cohorts, setCohorts] = useState<CohortRow[]>([
    {
      id: "cohort-search-sep",
      cohort_date: "2026-09-01",
      acquisition_source: "SEARCH",
      cohort_size: 450,
      d1_rate: 0.32,
      d7_rate: 0.21,
      d30_rate: 0.12,
      trip_cycle_rate: 0.26,
      next_trip_rate: 0.22,
      destination_expansion_rate: 0.38,
    },
    {
      id: "cohort-creator-sep",
      cohort_date: "2026-09-05",
      acquisition_source: "CREATOR",
      cohort_size: 320,
      d1_rate: 0.44,
      d7_rate: 0.28,
      d30_rate: 0.18,
      trip_cycle_rate: 0.31,
      next_trip_rate: 0.27,
      destination_expansion_rate: 0.44,
    },
    {
      id: "cohort-map-sep",
      cohort_date: "2026-09-10",
      acquisition_source: "MAP",
      cohort_size: 280,
      d1_rate: 0.29,
      d7_rate: 0.19,
      d30_rate: 0.11,
      trip_cycle_rate: 0.22,
      next_trip_rate: 0.19,
      destination_expansion_rate: 0.42,
    },
    {
      id: "cohort-ref-sep",
      cohort_date: "2026-09-15",
      acquisition_source: "REFERRAL",
      cohort_size: 190,
      d1_rate: 0.52,
      d7_rate: 0.35,
      d30_rate: 0.24,
      trip_cycle_rate: 0.38,
      next_trip_rate: 0.31,
      destination_expansion_rate: 0.48,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/cohorts", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.items && data.items.length > 0) {
          setCohorts(data.items);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-blue-400 font-semibold">
          Cohort Dynamics • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Traveler Cohort Retention &amp; Task Evolution
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Compare diagnostic retention (D1-D30) against meaningful tourism tasks across acquisition channels.
        </p>
      </div>

      <RetentionCohortTable cohorts={cohorts} />
    </div>
  );
}
