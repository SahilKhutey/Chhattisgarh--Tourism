"use client";

import React, { useEffect, useState } from "react";
import { OperationalReadiness } from "@/components/market-validation/OperationalReadiness";

export default function OperationalReadinessAdminPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/v1/market-validation/pilots")
      .then((res) => res.json())
      .then((pilots) => {
        if (Array.isArray(pilots) && pilots.length > 0) {
          fetch(`/api/v1/market-validation/operational-readiness/${pilots[0].id}`)
            .then((r) => r.json())
            .then((d) => setData(d));
        }
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Operational Runway &amp; Founder Dependency
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Tracking support desk capacity, content turnaround SLAs, and founder decoupling targets before scaling.
        </p>
      </div>

      <OperationalReadiness
        supportCapacity={data?.support_capacity}
        contentOperations={data?.content_operations}
        technicalOperations={data?.technical_operations}
        founderDependencyMetrics={data?.founder_dependency_metrics}
        founderInterventionRate={data?.founder_intervention_rate ?? 0.117}
        readinessStatus={data?.readiness_status ?? "READY"}
      />
    </div>
  );
}
