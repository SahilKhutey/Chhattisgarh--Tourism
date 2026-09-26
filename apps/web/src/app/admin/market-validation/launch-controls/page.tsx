"use client";

import React, { useEffect, useState } from "react";
import { LaunchControlPanel, LaunchControlItem } from "@/components/market-validation/LaunchControlPanel";

export default function LaunchControlsAdminPage() {
  const [controls, setControls] = useState<LaunchControlItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/market-validation/pilots")
      .then((res) => res.json())
      .then((pilots) => {
        if (Array.isArray(pilots) && pilots.length > 0) {
          fetch(`/api/v1/market-validation/launch-controls/${pilots[0].id}`)
            .then((r) => r.json())
            .then((d) => setControls(d));
        }
      });
  }, []);

  const handleToggle = (controlId: string, enabled: boolean) => {
    fetch(`/api/v1/market-validation/launch-controls/control/${controlId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-User-Role": "PILOT_OPERATOR",
      },
      body: JSON.stringify({ enabled }),
    })
      .then((r) => r.json())
      .then((updated) => {
        setControls((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Automated Launch Controls &amp; Circuit Breakers
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Safety throttles, booking caps, and emergency circuit breakers to protect traveler trust and host capacity.
        </p>
      </div>

      <LaunchControlPanel controls={controls} onToggleControl={handleToggle} />
    </div>
  );
}
