import { Skeleton } from "@/components/feedback/Skeleton";
import { CardSkeleton } from "../CardSkeleton/CardSkeleton";
import { ListSkeleton } from "../ListSkeleton/ListSkeleton";
import { MapLoading } from "../MapLoading/MapLoading";
import type { ContentLoadingShape } from "@/core/ui/loading/types";
import { cn } from "@/lib/ui/cn";

export interface ContentSkeletonProps {
  shape?: ContentLoadingShape;
  className?: string;
}

export function ContentSkeleton({
  shape = "mixed",
  className,
}: ContentSkeletonProps) {
  switch (shape) {
    case "hero":
      return (
        <div aria-hidden="true" className={cn("space-y-4 w-full", className)}>
          <Skeleton className="aspect-[21/9] w-full min-h-[240px] rounded-xl" />
          <div className="space-y-2 max-w-2xl">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      );

    case "article":
      return (
        <article aria-hidden="true" className={cn("space-y-6 max-w-3xl", className)}>
          <div className="space-y-3">
            <Skeleton className="h-9 w-4/5" />
            <div className="flex gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <Skeleton className="aspect-[16/9] w-full rounded-lg" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </article>
      );

    case "card-grid":
      return (
        <div
          aria-hidden="true"
          className={cn("grid gap-6 sm:grid-cols-2 lg:grid-cols-3", className)}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      );

    case "list":
      return <ListSkeleton count={5} className={className} />;

    case "detail":
      return (
        <div aria-hidden="true" className={cn("space-y-8", className)}>
          <Skeleton className="aspect-[16/9] max-h-[420px] w-full rounded-2xl" />
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="md:col-span-2 space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          </div>
        </div>
      );

    case "map":
      return <MapLoading className={className} />;

    case "mixed":
    default:
      return (
        <div aria-hidden="true" className={cn("space-y-8", className)}>
          <div className="space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-1/3" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      );
  }
}
