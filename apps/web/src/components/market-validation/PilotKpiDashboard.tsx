import React from "react";

export interface PilotKpiDashboardProps {
  totalTravelers?: number;
  discoveryToPlanningRate?: number;
  leadQualificationRate?: number;
  providerResponseRate?: number;
  tripCycleRetention?: number;
}

export function PilotKpiDashboard({
  totalTravelers = 184,
  discoveryToPlanningRate = 0.264,
  leadQualificationRate = 0.725,
  providerResponseRate = 0.812,
  tripCycleRetention = 0.235,
}: PilotKpiDashboardProps) {
  const kpis = [
    {
      title: "Pilot Travelers Sample",
      value: totalTravelers,
      unit: "Visitors",
      benchmark: "Target: 200",
      status: "ON_TRACK",
    },
    {
      title: "Discovery → Itinerary",
      value: `${(discoveryToPlanningRate * 100).toFixed(1)}%`,
      unit: "Conversion",
      benchmark: "Threshold: 20%",
      status: "HEALTHY",
    },
    {
      title: "Lead Qualification Rate",
      value: `${(leadQualificationRate * 100).toFixed(1)}%`,
      unit: "Intent",
      benchmark: "Threshold: 65%",
      status: "HEALTHY",
    },
    {
      title: "Host Response Rate",
      value: `${(providerResponseRate * 100).toFixed(1)}%`,
      unit: "SLA",
      benchmark: "Threshold: 75%",
      status: "HEALTHY",
    },
    {
      title: "Trip Cycle Retention",
      value: `${(tripCycleRetention * 100).toFixed(1)}%`,
      unit: "Re-engagement",
      benchmark: "Threshold: 20%",
      status: "HEALTHY",
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="pilot-kpi-dashboard">
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Pilot Execution Performance KPIs</h3>
        <p className="text-xs text-slate-500">
          Core conversion and engagement telemetry benchmarked against pre-set pilot validation gates
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpis.map((kpi, idx) => (
          <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
            <div className="text-[11px] font-semibold text-slate-500 truncate">{kpi.title}</div>
            <div className="text-xl font-extrabold text-slate-900 mt-1">{kpi.value}</div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">{kpi.benchmark}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
