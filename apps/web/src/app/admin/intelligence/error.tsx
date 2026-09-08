"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Intelligence dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-rose-500/20 rounded-2xl text-center">
      <AlertCircle className="w-12 h-12 text-rose-400 mb-4" />
      <h2 className="text-xl font-medium text-white mb-2">Regional Intelligence Offline</h2>
      <p className="text-slate-400 text-sm max-w-md mb-6">
        Unable to aggregate regional tourism data. The telemetry service or database may be experiencing high load.
      </p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors"
      >
        Retry Intelligence Query
      </button>
    </div>
  );
}
