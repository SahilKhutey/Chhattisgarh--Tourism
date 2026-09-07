import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-sand-beige">
      <div className="bg-forest-emerald pt-8 pb-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-3">
          <Skeleton className="h-6 w-48 bg-white/20" />
          <Skeleton className="h-10 w-96 bg-white/20" />
          <Skeleton className="h-4 w-2/3 bg-white/20" />
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        <Skeleton className="h-16 w-full rounded-2xl mb-6" />
        <Skeleton className="h-[680px] w-full rounded-2xl" />
      </div>
    </main>
  );
}
