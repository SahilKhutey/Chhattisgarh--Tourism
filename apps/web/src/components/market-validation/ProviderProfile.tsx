import React from "react";
import { ProviderItem } from "./ProviderTable";

export interface ProviderProfileProps {
  provider: ProviderItem;
  researchCount?: number;
  onRecordResearch?: () => void;
  onStartExperiment?: () => void;
}

export function ProviderProfile({
  provider,
  researchCount = 0,
  onRecordResearch,
  onStartExperiment,
}: ProviderProfileProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 uppercase">
            {provider.provider_type}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-2">{provider.business_name}</h2>
          <p className="text-sm text-slate-500">
            {provider.operating_area}, {provider.geography}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${
            provider.verification_status === "VERIFIED"
              ? "bg-green-100 text-green-800 border-green-200"
              : "bg-amber-100 text-amber-800 border-amber-200"
          }`}
        >
          {provider.verification_status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
        <div>
          <div className="text-xs text-slate-400 font-medium">Segment</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">{provider.segment}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Digital Presence</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">{provider.digital_presence}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Willingness to Pay</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">{provider.willingness_to_pay}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400 font-medium">Field Research</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">
            {researchCount} interview{researchCount === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        {onRecordResearch && (
          <button
            onClick={onRecordResearch}
            className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition"
          >
            Record Field Research
          </button>
        )}
        {onStartExperiment && (
          <button
            onClick={onStartExperiment}
            className="px-4 py-2 text-sm font-medium border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition"
          >
            Create Listing Experiment
          </button>
        )}
      </div>
    </div>
  );
}
