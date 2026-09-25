import React from "react";

interface InterviewTimelineProps {
  currentStatus: string;
}

const LIFECYCLE_STEPS = [
  { id: "PLANNED", label: "Planned" },
  { id: "SCHEDULED", label: "Scheduled" },
  { id: "CONDUCTED", label: "Conducted" },
  { id: "TRANSCRIBED", label: "Transcribed" },
  { id: "ANALYZED", label: "Analyzed" },
];

export function InterviewTimeline({ currentStatus }: InterviewTimelineProps) {
  const currentIdx = LIFECYCLE_STEPS.findIndex((s) => s.id === currentStatus);

  return (
    <div className="flex items-center w-full max-w-lg py-2">
      {LIFECYCLE_STEPS.map((step, idx) => {
        const isPassed = idx < currentIdx;
        const isCurrent = idx === currentIdx;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isPassed
                    ? "bg-teal-500 text-slate-950 ring-4 ring-teal-500/20"
                    : isCurrent
                    ? "bg-teal-500/20 text-teal-300 border-2 border-teal-500 ring-4 ring-teal-500/10"
                    : "bg-slate-800 text-slate-500 border border-slate-700"
                }`}
              >
                {idx + 1}
              </div>
              <span
                className={`text-[10px] mt-1 font-medium whitespace-nowrap ${
                  isCurrent
                    ? "text-teal-400 font-semibold"
                    : isPassed
                    ? "text-slate-300"
                    : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < LIFECYCLE_STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 -mt-3.5 transition-all ${
                  idx < currentIdx ? "bg-teal-500" : "bg-slate-800"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
