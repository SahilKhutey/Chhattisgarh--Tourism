import React from "react";
import Link from "next/link";
import { Users, Video, AlertCircle, Compass, CheckCircle2, HelpCircle } from "lucide-react";

export interface ResearchSummaryData {
  participants_count: number;
  interviews_count: number;
  problems_count: number;
  strongest_problem: string;
  highest_pain_cluster: string;
  most_fragmented_workflow: string;
  journey_distribution: Record<string, number>;
  validated_jtbds: Array<{ key: string; title: string; status: string }>;
}

interface ResearchDashboardProps {
  summary: ResearchSummaryData;
}

export function ResearchDashboard({ summary }: ResearchDashboardProps) {
  const maxJourneyVal = Math.max(...Object.values(summary.journey_distribution || {}), 1);

  return (
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-100 block">
              {summary.participants_count}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Research Participants
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-100 block">
              {summary.interviews_count}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Interviews Conducted
            </span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-100 block">
              {summary.problems_count}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              Identified Problems
            </span>
          </div>
        </div>
      </div>

      {/* Strategic Insights Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium mb-1">
            Strongest Identified Problem
          </span>
          <p className="text-sm font-semibold text-slate-100 leading-snug">
            {summary.strongest_problem}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium mb-1">
            Highest Pain Cluster
          </span>
          <p className="text-sm font-semibold text-rose-400 leading-snug">
            {summary.highest_pain_cluster}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 block font-medium mb-1">
            Most Fragmented Workflow
          </span>
          <p className="text-sm font-semibold text-amber-400 leading-snug">
            {summary.most_fragmented_workflow}
          </p>
        </div>
      </div>

      {/* Journey Problems & Validated JTBD */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Journey Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-400" />
            <span>Problems by Journey Stage</span>
          </h3>

          <div className="space-y-3">
            {Object.entries(summary.journey_distribution || {}).map(([stage, count]) => {
              const pct = Math.round((count / maxJourneyVal) * 100);
              return (
                <div key={stage} className="text-xs">
                  <div className="flex justify-between text-slate-300 mb-1 font-medium">
                    <span>{stage}</span>
                    <span className="text-slate-400">{count} problems</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Validated JTBD Status */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Validated Jobs-To-Be-Done (JTBD)</span>
            </h3>

            <div className="space-y-2.5">
              {summary.validated_jtbds.length > 0 ? (
                summary.validated_jtbds.map((j) => (
                  <div
                    key={j.key}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-teal-400 font-bold">{j.key}</span>
                      <span className="text-slate-200 font-medium">{j.title}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        j.status === "STRONGLY_SUPPORTED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-teal-500/10 text-teal-400 border-teal-500/30"
                      }`}
                    >
                      {j.status.replace("_", " ")}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 p-4 text-center bg-slate-950/40 rounded-lg">
                  No JTBD marked supported yet. Perform live interviews and validation evaluations.
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex justify-end">
            <Link
              href="/admin/market-validation/validation"
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              Manage JTBD Validation Gates →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
