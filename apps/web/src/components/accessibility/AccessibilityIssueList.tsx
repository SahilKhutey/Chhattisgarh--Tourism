"use client";

import React from "react";
import type { AccessibilityIssue } from "@/types/accessibility";

interface Props {
  issues: AccessibilityIssue[];
  onRemediate?: (fieldKey: string) => void;
}

export function AccessibilityIssueList({ issues, onRemediate }: Props) {
  if (!issues || issues.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center text-sm text-emerald-400">
        ✓ No accessibility violations detected. Full WCAG image/gallery alt-text compliance achieved.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {issues.map((issue, idx) => (
        <div
          key={`${issue.code}-${idx}`}
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900/40 p-4 transition-colors hover:bg-slate-900/70"
        >
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                  issue.severity === "BLOCKER"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                }`}
              >
                {issue.severity}
              </span>
              <span className="font-mono text-xs font-semibold text-slate-300">
                {issue.code}
              </span>
              {issue.field_key && (
                <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-xs text-teal-400">
                  {issue.field_key}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-200">{issue.message}</p>
            {issue.remediation && (
              <p className="text-xs text-slate-400">
                <strong className="text-slate-300">Remediation:</strong> {issue.remediation}
              </p>
            )}
          </div>

          {onRemediate && issue.field_key && (
            <button
              type="button"
              onClick={() => onRemediate(issue.field_key!)}
              className="shrink-0 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Fix Issue
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
