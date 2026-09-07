import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-label="Loading destinations"
      className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8"
    >
      <Skeleton className="h-5 w-40" />
      <Skeleton className="mt-4 h-12 w-72" />
      <Skeleton className="mt-4 h-5 w-full max-w-xl" />
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="overflow-hidden rounded-2xl border border-charcoal-stone/10">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
