import React from "react";

export interface OperationalReadinessProps {
  supportCapacity?: {
    agents_count?: number;
    coverage_hours?: string;
    max_concurrent_chats?: number;
  };
  contentOperations?: {
    curators_count?: number;
    turnaround_time_hours?: number;
  };
  technicalOperations?: {
    uptime_target_pct?: number;
    p95_latency_ms?: number;
  };
  founderDependencyMetrics?: {
    total_weekly_tasks?: number;
    founder_involved_tasks?: number;
  };
  founderInterventionRate?: number;
  readinessStatus?: string;
}

export function OperationalReadiness({
  supportCapacity = { agents_count: 2, coverage_hours: "08:00 - 20:00 IST", max_concurrent_chats: 15 },
  contentOperations = { curators_count: 1, turnaround_time_hours: 24 },
  technicalOperations = { uptime_target_pct: 99.9, p95_latency_ms: 140 },
  founderDependencyMetrics = { total_weekly_tasks: 120, founder_involved_tasks: 14 },
  founderInterventionRate = 0.117,
  readinessStatus = "READY",
}: OperationalReadinessProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="operational-readiness">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Operational Readiness & Founder Decoupling</h3>
          <p className="text-xs text-slate-500">
            Monitoring operational runway, SLA limits, and manual founder dependency before scale
          </p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            readinessStatus === "READY"
              ? "bg-emerald-100 text-emerald-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {readinessStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Support & Field Ops */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider text-slate-500">
            Support Desk Capacity
          </div>
          <div className="space-y-1 text-slate-600">
            <div>Dedicated Staff: <span className="font-semibold text-slate-800">{supportCapacity.agents_count} Agents</span></div>
            <div>Coverage Window: <span className="font-semibold text-slate-800">{supportCapacity.coverage_hours}</span></div>
            <div>Max Load: <span className="font-semibold text-slate-800">{supportCapacity.max_concurrent_chats} Chats</span></div>
          </div>
        </div>

        {/* Content & Curation */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
          <div className="font-bold text-slate-800 mb-1.5 uppercase text-[10px] tracking-wider text-slate-500">
            Content & Verification Ops
          </div>
          <div className="space-y-1 text-slate-600">
            <div>Regional Curators: <span className="font-semibold text-slate-800">{contentOperations.curators_count}</span></div>
            <div>Listing SLA: <span className="font-semibold text-slate-800">{contentOperations.turnaround_time_hours} Hours</span></div>
            <div>System Latency: <span className="font-semibold text-slate-800">{technicalOperations.p95_latency_ms} ms</span></div>
          </div>
        </div>

        {/* Founder Decoupling Metric */}
        <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs">
          <div className="font-bold text-emerald-900 mb-1.5 uppercase text-[10px] tracking-wider">
            Founder Decoupling Ratio
          </div>
          <div className="text-2xl font-extrabold text-emerald-800">
            {(founderInterventionRate * 100).toFixed(1)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Founder touches {founderDependencyMetrics.founder_involved_tasks} of {founderDependencyMetrics.total_weekly_tasks} weekly operational workflows. Target: &lt; 20%.
          </p>
        </div>
      </div>
    </div>
  );
}
