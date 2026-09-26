import React from "react";

export interface LaunchReadinessScorecardProps {
  productReady?: boolean;
  contentReady?: boolean;
  geographyReady?: boolean;
  supplyReady?: boolean;
  consumerReady?: boolean;
  transactionReady?: boolean;
  analyticsReady?: boolean;
  supportReady?: boolean;
  securityReady?: boolean;
  privacyReady?: boolean;
  safetyReady?: boolean;
  operationalReady?: boolean;
  readinessPercentage?: number;
  overallStatus?: string;
  blockers?: string[];
  warnings?: string[];
}

export function LaunchReadinessScorecard({
  productReady = true,
  contentReady = true,
  geographyReady = true,
  supplyReady = true,
  consumerReady = true,
  transactionReady = true,
  analyticsReady = true,
  supportReady = true,
  securityReady = true,
  privacyReady = true,
  safetyReady = true,
  operationalReady = true,
  readinessPercentage = 100,
  overallStatus = "READY",
  blockers = [],
  warnings = [],
}: LaunchReadinessScorecardProps) {
  const gates = [
    { label: "Product Core", ready: productReady },
    { label: "Content Coverage", ready: contentReady },
    { label: "Geographic Data", ready: geographyReady },
    { label: "Supply Activation", ready: supplyReady },
    { label: "Consumer Demand", ready: consumerReady },
    { label: "Transaction Handoff", ready: transactionReady },
    { label: "Analytics Pipeline", ready: analyticsReady },
    { label: "Support Desk", ready: supportReady },
    { label: "Security Hardening", ready: securityReady },
    { label: "Privacy Compliance", ready: privacyReady },
    { label: "Safety Protocols", ready: safetyReady },
    { label: "Ops & Monitoring", ready: operationalReady },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="launch-readiness-scorecard">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">12-Gate Launch Readiness Assessment</h3>
          <p className="text-xs text-slate-500">
            Rigorous pre-launch certification across technical, operational, and regulatory checkpoints
          </p>
        </div>
        <div className="text-right">
          <div className="text-base font-extrabold text-slate-900">{readinessPercentage}%</div>
          <span
            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
              overallStatus === "READY"
                ? "bg-emerald-100 text-emerald-800"
                : overallStatus === "BLOCKED"
                ? "bg-rose-100 text-rose-800"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {overallStatus}
          </span>
        </div>
      </div>

      {/* 12 Gates Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {gates.map((g, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
              g.ready
                ? "bg-emerald-50/50 border-emerald-200 text-emerald-900"
                : "bg-rose-50/50 border-rose-200 text-rose-900"
            }`}
          >
            <span className="font-semibold">{g.label}</span>
            <span className={`font-bold ${g.ready ? "text-emerald-700" : "text-rose-700"}`}>
              {g.ready ? "PASS" : "FAIL"}
            </span>
          </div>
        ))}
      </div>

      {/* Blockers & Warnings */}
      {blockers.length > 0 && (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800">
          <div className="font-bold mb-1">Launch Blockers ({blockers.length})</div>
          <ul className="list-disc list-inside space-y-0.5">
            {blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
          <div className="font-bold mb-1">Operational Warnings ({warnings.length})</div>
          <ul className="list-disc list-inside space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
