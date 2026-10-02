"use client";

import React from "react";
import { X, Compass, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import type { MapGuide as MapGuideModel, MapGuideStep } from "@/core/ui/map/guides";
import { sortGuideSteps } from "@/core/ui/map/guides";
import { GuideStep } from "./GuideStep";

export interface MapGuideProps {
  guide: MapGuideModel | null;
  activeStepId?: string;
  onSelectStep: (step: MapGuideStep) => void;
  onClose: () => void;
  className?: string;
}

export function MapGuide({
  guide,
  activeStepId,
  onSelectStep,
  onClose,
  className = "",
}: MapGuideProps) {
  if (!guide) return null;

  const sortedSteps = sortGuideSteps(guide.steps);
  const currentStepIndex = sortedSteps.findIndex((s) => s.id === activeStepId);
  const effectiveIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
  const currentStep = sortedSteps[effectiveIndex];

  function handlePrev() {
    if (effectiveIndex > 0) {
      onSelectStep(sortedSteps[effectiveIndex - 1]);
    }
  }

  function handleNext() {
    if (effectiveIndex < sortedSteps.length - 1) {
      onSelectStep(sortedSteps[effectiveIndex + 1]);
    }
  }

  return (
    <div
      role="region"
      aria-label={`${guide.title} itinerary guide`}
      className={`fixed sm:absolute inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto sm:left-4 sm:top-24 z-[1000] w-full sm:w-88 rounded-t-3xl sm:rounded-2xl border border-neutral-200/90 bg-white/98 p-4 shadow-xl backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-900/98 animate-in slide-in-from-bottom sm:slide-in-from-left duration-200 ${className}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
              <Compass className="h-3 w-3" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
              Curated Trail Guide
            </span>
          </div>
          <h3 className="text-sm font-bold text-foreground leading-tight">
            {guide.title}
          </h3>
          {guide.estimatedDurationMinutes && (
            <div className="flex items-center gap-1 mt-1 text-[11px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>Est. {guide.estimatedDurationMinutes} mins total</span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close guide"
          className="rounded-lg p-1 text-muted-foreground hover:bg-neutral-100 hover:text-foreground dark:hover:bg-neutral-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {guide.description && (
        <p className="my-2.5 text-xs text-muted-foreground leading-relaxed">
          {guide.description}
        </p>
      )}

      {/* Stepper List */}
      <div className="my-3 max-h-60 overflow-y-auto space-y-1">
        {sortedSteps.map((step, idx) => (
          <GuideStep
            key={step.id}
            step={step}
            isActive={currentStep?.id === step.id}
            isCompleted={idx < effectiveIndex}
            onSelectStep={onSelectStep}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between border-t border-neutral-100 pt-2.5 dark:border-neutral-800">
        <button
          type="button"
          onClick={handlePrev}
          disabled={effectiveIndex <= 0}
          aria-label="Previous trail step"
          className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-neutral-100 disabled:opacity-40 disabled:pointer-events-none dark:hover:bg-neutral-800 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous</span>
        </button>

        <span className="text-[11px] font-mono font-medium text-muted-foreground">
          Step {effectiveIndex + 1} of {sortedSteps.length}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={effectiveIndex >= sortedSteps.length - 1}
          aria-label="Next trail step"
          className="inline-flex items-center gap-1 rounded-xl bg-forest-emerald px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-forest-emerald/90 disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          <span>Next</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
