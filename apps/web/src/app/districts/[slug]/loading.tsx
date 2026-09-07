import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-36 mb-8" />
      <div className="mb-12 space-y-4">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-14 w-2/3" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-charcoal-stone/10">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
