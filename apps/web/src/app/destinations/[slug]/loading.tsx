import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-5 w-32 mb-6" />
      <Skeleton className="aspect-[21/9] w-full rounded-3xl mb-10" />
      <div className="max-w-4xl space-y-5">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-14 w-3/4" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-5/6" />
        <Skeleton className="h-6 w-4/5" />
        <div className="grid gap-4 sm:grid-cols-3 pt-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
