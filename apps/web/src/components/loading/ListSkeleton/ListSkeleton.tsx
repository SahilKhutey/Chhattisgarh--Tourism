import { Skeleton } from "@/components/feedback/Skeleton";
import { cn } from "@/lib/ui/cn";

export interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export function ListSkeleton({ count = 5, className }: ListSkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("space-y-4", className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex gap-4 rounded-lg border bg-card p-4 shadow-xs"
        >
          <Skeleton className="h-20 w-24 shrink-0 rounded-lg" />

          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
