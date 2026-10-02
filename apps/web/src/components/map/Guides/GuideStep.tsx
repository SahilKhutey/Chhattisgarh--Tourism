"use client";

import React from "react";
import { CheckCircle2, Circle, MapPin } from "lucide-react";
import type { MapGuideStep } from "@/core/ui/map/guides";

export interface GuideStepProps {
  step: MapGuideStep;
  isActive: boolean;
  isCompleted?: boolean;
  onSelectStep: (step: MapGuideStep) => void;
}

export function GuideStep({
  step,
  isActive,
  isCompleted = false,
  onSelectStep,
}: GuideStepProps) {
  return (
    <button
      type="button"
      onClick={() => onSelectStep(step)}
      aria-current={isActive ? "step" : undefined}
      className={`w-full text-left flex items-start gap-3 p-2.5 rounded-xl transition-all ${
        isActive
          ? "bg-forest-emerald/10 border border-forest-emerald/30 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/40"
          : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
      }`}
    >
      {/* Order Badge / Status */}
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors">
        {isCompleted ? (
          <CheckCircle2 className="h-5 w-5 text-forest-emerald" />
        ) : isActive ? (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-forest-emerald text-white text-xs font-bold">
            {step.order}
          </div>
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300 text-xs font-medium">
            {step.order}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <h4
            className={`text-xs font-bold truncate ${
              isActive ? "text-forest-emerald dark:text-emerald-400" : "text-foreground"
            }`}
          >
            {step.title}
          </h4>
          {step.durationMinutes && (
            <span className="text-[10px] text-muted-foreground shrink-0">
              ~{step.durationMinutes}m
            </span>
          )}
        </div>

        {step.description && (
          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
            {step.description}
          </p>
        )}

        {step.coordinate && (
          <div className="flex items-center gap-1 mt-1 text-[10px] text-forest-emerald">
            <MapPin className="h-3 w-3" />
            <span>Map location</span>
          </div>
        )}
      </div>
    </button>
  );
}
