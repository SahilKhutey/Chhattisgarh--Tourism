import { Skeleton } from "@/components/feedback/Skeleton";
import { cn } from "@/lib/ui/cn";

export interface MapLoadingProps {
  label?: string;
  className?: string;
}

export function MapLoading({
  label = "Loading map…",
  className,
}: MapLoadingProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn(
        "relative min-h-[320px] w-full overflow-hidden rounded-xl border bg-muted/40",
        className,
      )}
    >
      <Skeleton className="absolute inset-0 h-full w-full rounded-none" />

      <div className="absolute inset-0 flex items-center justify-center">
        <span className="rounded-md bg-background/90 px-4 py-2 text-sm font-medium shadow-sm border backdrop-blur-sm">
          {label}
        </span>
      </div>
    </div>
  );
}
