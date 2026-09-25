"use client";

import React, { useEffect, useState } from "react";
import { ProblemCard, ConsumerProblemData } from "@/components/market-validation/ProblemCard";
import { AlertCircle, Filter } from "lucide-react";

const STAGES = [
  "ALL",
  "DISCOVERY",
  "EVALUATION",
  "DECISION",
  "PLANNING",
  "TRAVEL",
  "EXPERIENCE",
  "BOOKING",
];

export default function ProblemsAdminPage() {
  const [problems, setProblems] = useState<ConsumerProblemData[]>([]);
  const [selectedStage, setSelectedStage] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const url =
      selectedStage !== "ALL"
        ? `/api/v1/market-validation/problems?journey_stage=${selectedStage}`
        : "/api/v1/market-validation/problems";

    fetch(url, {
      headers: {
        "X-User-Role": "MARKET_RESEARCHER",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setProblems(data.items || []);
        setLoading(false);
      })
      .catch(() => {
        setProblems([]);
        setLoading(false);
      });
  }, [selectedStage]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold">
            Pain Map & Friction Catalog
          </span>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight mt-1">
            Consumer Problems
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Scored by quantitative pain: Frequency × Severity × Time Cost × Trust Impact.
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Stage:
          </span>
          {STAGES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStage(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all ${
                selectedStage === st
                  ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading problem catalog...</div>
      ) : problems.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          No problems found for this stage. Record problems during research interviews.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map((p) => (
            <ProblemCard key={p.id} problem={p} />
          ))}
        </div>
      )}
    </div>
  );
}
