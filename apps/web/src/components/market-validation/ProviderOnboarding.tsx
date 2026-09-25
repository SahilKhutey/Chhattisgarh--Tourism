import React from "react";

export interface OnboardingData {
  id: string;
  provider_id: string;
  current_step: number;
  status: string;
  completion_rate: number;
  required_fields_completed: boolean;
  time_to_onboard_seconds?: number;
}

export interface ProviderOnboardingProps {
  onboarding: OnboardingData;
  onAdvanceStep?: (nextStep: number) => void;
  onComplete?: () => void;
}

const STEPS = [
  { step: 1, name: "Basic Info" },
  { step: 2, name: "Services" },
  { step: 3, name: "Location" },
  { step: 4, name: "Operations" },
  { step: 5, name: "Experience" },
  { step: 6, name: "Media" },
  { step: 7, name: "Review" },
];

export function ProviderOnboarding({
  onboarding,
  onAdvanceStep,
  onComplete,
}: ProviderOnboardingProps) {
  const pct = Math.round(onboarding.completion_rate * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Onboarding Progression</h3>
          <p className="text-xs text-slate-500">Step {onboarding.current_step} of 7 • Status: {onboarding.status}</p>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-emerald-600">{pct}%</span>
          <div className="text-[11px] text-slate-400">Completion Rate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6">
        <div
          className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {STEPS.map((s) => {
          const isDone = s.step < onboarding.current_step || onboarding.status === "COMPLETED";
          const isCurrent = s.step === onboarding.current_step && onboarding.status !== "COMPLETED";
          return (
            <div
              key={s.step}
              className={`p-2 text-center rounded border text-xs ${
                isDone
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-semibold"
                  : isCurrent
                  ? "bg-blue-50 border-blue-300 text-blue-800 font-bold"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              }`}
            >
              <div>#{s.step}</div>
              <div className="truncate text-[10px] mt-0.5">{s.name}</div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          Required fields:{" "}
          <span className={onboarding.required_fields_completed ? "text-green-600 font-semibold" : "text-amber-600 font-semibold"}>
            {onboarding.required_fields_completed ? "Completed" : "Pending"}
          </span>
        </div>
        <div className="flex gap-2">
          {onAdvanceStep && onboarding.current_step < 7 && onboarding.status !== "COMPLETED" && (
            <button
              onClick={() => onAdvanceStep(onboarding.current_step + 1)}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white rounded hover:bg-slate-700 transition"
            >
              Next Step &rarr;
            </button>
          )}
          {onComplete && onboarding.status !== "COMPLETED" && (
            <button
              onClick={onComplete}
              className="px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded hover:bg-emerald-700 transition"
            >
              Complete & Activate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
