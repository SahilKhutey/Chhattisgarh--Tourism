export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse text-teal-500">
      <div className="h-8 w-64 bg-slate-800 rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-slate-900 border border-slate-800 rounded-2xl"></div>
    </div>
  );
}
