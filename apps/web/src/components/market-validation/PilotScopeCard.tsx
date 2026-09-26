import React from "react";

export interface PilotScopeCardProps {
  inScope?: string[];
  outOfScope?: string[];
}

export function PilotScopeCard({
  inScope = [
    "Destination discovery & verified place navigation",
    "Itinerary builder & travel duration calculation",
    "Direct provider inquiry dispatch via WhatsApp/SMS",
    "Verified homestay & guide listings (Bastar circuit)",
  ],
  outOfScope = [
    "Statewide uncurated self-serve marketplace",
    "Custodial payment escrow & hotel deposit holding",
    "Unverified adventure sports booking",
    "Out-of-state regional expansion",
  ],
}: PilotScopeCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm" data-testid="pilot-scope-card">
      <div className="pb-3 border-b border-slate-100 mb-4">
        <h3 className="font-semibold text-slate-900 text-sm">Pilot Product Scope Boundaries</h3>
        <p className="text-xs text-slate-500">
          Strict guardrails defining features committed vs explicitly deferred for scale
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* In-Scope */}
        <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">
            <span>✓ In-Scope for Pilot</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {inScope.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>{item.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Out-of-Scope */}
        <div className="p-4 bg-rose-50/40 border border-rose-200 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 uppercase tracking-wider mb-2">
            <span>✗ Explicitly Out-of-Scope</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {outOfScope.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-600 font-bold shrink-0">•</span>
                <span>{item.replace(/_/g, " ")}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
