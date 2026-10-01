import { CardSkeleton } from "../CardSkeleton/CardSkeleton";
import { Skeleton } from "@/components/feedback/Skeleton";
import { cn } from "@/lib/ui/cn";

export interface SectionLoadingProps {
  title?: string;
  count?: number;
  className?: string;
}

export function SectionLoading({
  title,
  count = 3,
  className,
}: SectionLoadingProps) {
  return (
    <section
      aria-busy="true"
      aria-label={title || "Loading section"}
      className={cn("py-6 space-y-6", className)}
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}
