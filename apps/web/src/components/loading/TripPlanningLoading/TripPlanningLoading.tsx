import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

export const TRIP_PLANNING_STAGES = [
  "Planning your trip",
  "Finding destinations",
  "Checking routes",
  "Building itinerary",
  "Optimizing schedule",
  "Ready",
] as const;

export type TripPlanningStage = (typeof TRIP_PLANNING_STAGES)[number];

export interface TripPlanningLoadingProps {
  currentStage?: string;
  stageIndex?: number;
  stages?: readonly string[];
  message?: string;
  isLongRunning?: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  className?: string;
}

export function TripPlanningLoading({
  currentStage,
  stageIndex,
  stages = TRIP_PLANNING_STAGES,
  message,
  isLongRunning = false,
  onRetry,
  onCancel,
  className,
}: TripPlanningLoadingProps) {
  // Determine active stage label
  const activeLabel =
    currentStage ||
    (stageIndex !== undefined && stages[stageIndex] ? stages[stageIndex] : stages[0]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex flex-col items-center justify-center p-6 text-center rounded-xl border bg-card/60 backdrop-blur-xs shadow-xs max-w-md mx-auto space-y-4",
        className,
      )}
    >
      <Spinner size="lg" aria-hidden="true" />

      <div className="space-y-1">
        <h3 className="text-base font-semibold text-foreground">
          {activeLabel}
        </h3>
        <p className="text-xs text-muted-foreground">
          {message || "Crafting an authentic, sustainable Chhattisgarh travel plan…"}
        </p>
      </div>

      {/* Discrete stage list representing actual system stages */}
      <ol className="w-full text-left space-y-1.5 pt-2 border-t text-xs">
        {stages.map((stage, idx) => {
          const isDone = stageIndex !== undefined && idx < stageIndex;
          const isCurrent = stage === activeLabel || (stageIndex !== undefined && idx === stageIndex);

          return (
            <li
              key={stage}
              className={cn(
                "flex items-center gap-2",
                isCurrent && "font-medium text-primary",
                isDone && "text-muted-foreground line-through opacity-70",
                !isCurrent && !isDone && "text-muted-foreground/60",
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  isCurrent && "bg-primary animate-pulse",
                  isDone && "bg-muted-foreground",
                  !isCurrent && !isDone && "bg-border",
                )}
                aria-hidden="true"
              />
              <span>{stage}</span>
            </li>
          );
        })}
      </ol>

      {/* Long-running threshold context & exit paths */}
      {isLongRunning && (
        <div className="pt-2 w-full flex flex-col items-center gap-2 border-t">
          <p className="text-xs text-muted-foreground">
            This is taking a little longer to optimize local corridor connections.
          </p>
          <div className="flex gap-2">
            {onRetry && (
              <Button size="sm" variant="outline" onClick={onRetry}>
                Retry
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
