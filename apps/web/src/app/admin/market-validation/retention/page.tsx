"use client";

import React, { useEffect, useState } from "react";
import { TourismCycleCard } from "@/components/market-validation/TourismCycleCard";

interface RetentionOverviewData {
  total_meaningful_users: number;
  active_in_planning: number;
  completed_travelers: number;
  returned_travelers: number;
  trip_cycle_retention_rate: number;
  next_trip_rate: number;
  state_distribution: Record<string, number>;
  top_destinations_explored: Record<string, number>;
}

export default function RetentionAdminPage() {
  const [data, setData] = useState<RetentionOverviewData>({
    total_meaningful_users: 1420,
    active_in_planning: 604,
    completed_travelers: 180,
    returned_travelers: 44,
    trip_cycle_retention_rate: 0.245,
    next_trip_rate: 0.21,
    state_distribution: {
      DISCOVERED: 636,
      PLANNING: 604,
      COMPLETED: 136,
      RETURNED: 44,
    },
    top_destinations_explored: {
      "bastar-chitrakote": 412,
      "bastar-kanger": 320,
      "surguja-mainpat": 210,
    },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch("/api/v1/market-validation/retention/overview", {
      headers: { "X-User-Role": "MARKET_RESEARCHER" },
    })
      .then((res) => res.json())
      .then((resData) => {
        if (resData.total_meaningful_users) {
          setData(resData);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Episodic Engagement • MV8
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Retention &amp; Network Validation
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating trip-cycle retention, repeat task behavior, and regional network effects across Chhattisgarh circuits.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Meaningful Travelers</span>
          <p className="text-2xl font-bold text-white mt-1">{data.total_meaningful_users.toLocaleString()}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Trip Completers</span>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{data.completed_travelers}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Trip-Cycle Retention</span>
          <p className="text-2xl font-bold text-blue-400 mt-1">{(data.trip_cycle_retention_rate * 100).toFixed(1)}%</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium">Next-Trip Rate</span>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{(data.next_trip_rate * 100).toFixed(1)}%</p>
        </div>
      </div>

      <TourismCycleCard
        tripCycleRetentionRate={data.trip_cycle_retention_rate}
        nextTripRate={data.next_trip_rate}
      />
    </div>
  );
}
