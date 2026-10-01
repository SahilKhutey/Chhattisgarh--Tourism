import Link from "next/link";
import { cn } from "@/lib/ui/cn";

export interface TripEntryProps {
  activeTripCount?: number;
  className?: string;
}

export function TripEntry({ activeTripCount, className }: TripEntryProps) {
  return (
    <Link
      href="/planner"
      aria-label={activeTripCount ? `My Trips, ${activeTripCount} items` : "Plan a trip"}
      className={cn(
        "cg-interactive inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/10 transition-colors",
        className,
      )}
    >
      <svg
        className="h-4 w-4 shrink-0 text-primary"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="2"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
        />
      </svg>
      <span>{activeTripCount ? `Trips · ${activeTripCount}` : "Plan"}</span>
    </Link>
  );
}
