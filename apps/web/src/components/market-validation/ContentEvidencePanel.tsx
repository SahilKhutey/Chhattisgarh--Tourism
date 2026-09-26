import React from "react";

export interface EvidenceItemData {
  id: string;
  claim: string;
  field_name?: string | null;
  source_type: string;
  source_reference?: string | null;
  confidence: number;
  status: "VERIFIED" | "UNVERIFIED" | "STALE" | "CONTRADICTED" | "REJECTED";
  verifier?: string | null;
  verified_at?: string | null;
}

export interface ContentEvidencePanelProps {
  evidenceList: EvidenceItemData[];
  onVerify?: (id: string) => void;
  onAddEvidence?: () => void;
}

export function ContentEvidencePanel({
  evidenceList,
  onVerify,
  onAddEvidence,
}: ContentEvidencePanelProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-emerald-50 text-emerald-700 border-emerald-300";
      case "CONTRADICTED":
        return "bg-red-50 text-red-700 border-red-300";
      case "STALE":
        return "bg-amber-50 text-amber-700 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Provenance Ledger
          </span>
          <h4 className="text-base font-bold text-slate-900 mt-0.5">
            Content Evidence & Claim Verification
          </h4>
        </div>

        {onAddEvidence && (
          <button
            type="button"
            onClick={onAddEvidence}
            className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
          >
            + Attach Evidence
          </button>
        )}
      </div>

      {evidenceList.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          No evidence items attached yet.
        </div>
      ) : (
        <div className="space-y-3">
          {evidenceList.map((item) => (
            <div
              key={item.id}
              className="p-3.5 border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-0.5 rounded-full border font-bold text-[10px] ${getStatusBadge(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                  <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.source_type}
                  </span>
                  {item.field_name && (
                    <span className="text-slate-500 font-mono text-[11px]">
                      field: {item.field_name}
                    </span>
                  )}
                </div>

                <div className="text-slate-500 text-[11px]">
                  Confidence: <span className="font-bold text-slate-800">{Math.round(item.confidence * 100)}%</span>
                </div>
              </div>

              <p className="text-sm font-medium text-slate-800">{item.claim}</p>

              {item.source_reference && (
                <div className="text-xs text-slate-500">
                  <span className="font-semibold">Reference: </span>
                  {item.source_reference}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-xs">
                <span className="text-[11px] text-slate-400">
                  {item.verifier ? `Verified by ${item.verifier}` : "Awaiting reviewer sign-off"}
                </span>

                {item.status !== "VERIFIED" && onVerify && (
                  <button
                    type="button"
                    onClick={() => onVerify(item.id)}
                    className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded transition-colors"
                  >
                    Mark Verified
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
