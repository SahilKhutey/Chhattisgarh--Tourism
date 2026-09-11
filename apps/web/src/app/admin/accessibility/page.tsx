"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getAccessibilityAudit } from "@/lib/api/accessibility";
import { AccessibilitySummary } from "@/components/accessibility/AccessibilitySummary";
import { AccessibilityStatusBadge } from "@/components/accessibility/AccessibilityStatusBadge";

export default function AccessibilityPage() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin", "accessibility"],
    queryFn: getAccessibilityAudit,
  });

  return (
    <main className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Accessibility</h1>
        <p className="text-sm text-muted-foreground text-slate-400">
          Review accessibility compliance across published content.
        </p>
      </header>

      {isLoading ? (
        <div className="flex items-center space-x-3 text-sm text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
          <span>Loading accessibility audit…</span>
        </div>
      ) : isError ? (
        <div
          role="alert"
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-400"
        >
          {error instanceof Error ? error.message : "Unable to load accessibility audit."}
        </div>
      ) : (
        <>
          <AccessibilitySummary
            total={data?.total ?? 0}
            blockers={data?.blockers ?? 0}
            averageScore={data?.average_score ?? 0}
          />

          <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-200">
          Recent Content Audits
        </h2>

        <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50">
          <div className="grid grid-cols-12 gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 text-xs font-semibold uppercase text-slate-400">
            <span className="col-span-4">Content Entry ID</span>
            <span className="col-span-2">Locale</span>
            <span className="col-span-2">Score</span>
            <span className="col-span-2">Status</span>
            <span className="col-span-2 text-right">Issues</span>
          </div>

          {!data?.items || data.items.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No content audits recorded yet. Run audits during content publishing or manually on draft entries.
            </div>
          ) : (
            data.items.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-12 items-center gap-3 border-b border-slate-800/60 px-4 py-3 text-sm hover:bg-slate-800/30 transition-colors"
              >
                <div className="col-span-4 font-mono text-xs text-teal-400 truncate">
                  {item.content_entry_id}
                </div>
                <div className="col-span-2 uppercase font-mono text-xs text-slate-300">
                  {item.locale_code}
                </div>
                <div className="col-span-2 font-bold text-slate-200">
                  {item.score}%
                </div>
                <div className="col-span-2">
                  <AccessibilityStatusBadge status={item.status} />
                </div>
                <div className="col-span-2 text-right text-xs font-medium text-slate-400">
                  {item.issue_count} {item.issue_count === 1 ? "issue" : "issues"}
                </div>
              </div>
            ))
          )}
        </div>
      </section>
        </>
      )}
    </main>
  );
}
