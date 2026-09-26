"use client";

import React, { useEffect, useState } from "react";
import { PilotDefinition, PilotData } from "@/components/market-validation/PilotDefinition";
import { PilotScopeCard } from "@/components/market-validation/PilotScopeCard";
import { PilotKpiDashboard } from "@/components/market-validation/PilotKpiDashboard";

export default function PilotAdminPage() {
  const [pilot, setPilot] = useState<PilotData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPilot = () => {
    setLoading(true);
    fetch("/api/v1/market-validation/pilots", {
      headers: { "X-User-Role": "PILOT_OPERATOR" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPilot(data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPilot();
  }, []);

  const handlePause = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/pause`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleResume = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/resume`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleComplete = () => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/complete`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  const handleTransition = (target: string) => {
    if (!pilot) return;
    fetch(`/api/v1/market-validation/pilots/${pilot.id}/transition/${target}`, {
      method: "POST",
      headers: {
        "X-User-Role": "PILOT_OPERATOR",
        "If-Match": `"${pilot.version}"`,
      },
    })
      .then((res) => res.json())
      .then((updated) => setPilot(updated));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Pilot Definition &amp; Execution Command
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Operational pilot control center enforcing scope guardrails, state machine transitions, and concurrency locks.
        </p>
      </div>

      {pilot ? (
        <>
          <PilotDefinition
            pilot={pilot}
            onPause={handlePause}
            onResume={handleResume}
            onComplete={handleComplete}
            onTransition={handleTransition}
            isLoading={loading}
          />
          <PilotKpiDashboard />
          <PilotScopeCard
            inScope={pilot.product_scope?.in_scope}
            outOfScope={pilot.product_scope?.out_of_scope}
          />
        </>
      ) : (
        <div className="p-8 text-center text-slate-400 bg-slate-900/50 rounded-xl border border-slate-800">
          Loading pilot configuration...
        </div>
      )}
    </div>
  );
}
