import { CardSkeleton } from "../CardSkeleton/CardSkeleton";
import { Skeleton } from "@/components/feedback/Skeleton";
import { cn } from "@/lib/ui/cn";

export interface PageLoadingProps {
  className?: string;
}

export function PageLoading({ className }: PageLoadingProps) {
  return (
    <main
      aria-busy="true"
      aria-label="Loading page"
      className={cn("container mx-auto px-4 py-8", className)}
    >
      <div className="mb-8 space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
