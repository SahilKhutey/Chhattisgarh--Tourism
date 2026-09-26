"use client";

import React, { useEffect, useState } from "react";
import { ExpansionCandidateTable, ExpansionCandidateItem } from "@/components/market-validation/ExpansionCandidateTable";

export default function ExpansionAdminPage() {
  const [candidates, setCandidates] = useState<ExpansionCandidateItem[]>([]);

  useEffect(() => {
    fetch("/api/v1/market-validation/expansion?current_market=Bastar")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCandidates(data);
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="border-b border-slate-800 pb-5">
        <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
          Execution &amp; Scale Readiness • MV11
        </span>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
          Candidate Circuit Expansion Modeling
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Evaluating transferability from Bastar into Surguja, Bilaspur, and Raipur along operational and economic dimensions.
        </p>
      </div>

      <ExpansionCandidateTable candidates={candidates} />
    </div>
  );
}
