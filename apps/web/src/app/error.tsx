"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // We could log this to an external APM here
    console.error("UI System Failure Caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0D0F] text-charcoal-stone h-screen w-full">
      <div className="glass-panel p-8 md:p-12 rounded-3xl shadow-2xl border border-red-500/20 bg-red-950/20 max-w-lg text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
            System Interface Error
          </span>
          <h2 className="text-3xl font-sans font-bold text-sand-beige">
            Fatal Rendering Exception
          </h2>
          <p className="text-sm text-charcoal-stone/60 leading-relaxed font-mono">
            A critical UI failure occurred within the active component tree. Security protocols have sandboxed the error.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 px-6 rounded-xl font-bold transition-all shadow-md shadow-red-600/20"
          >
            <RotateCcw className="w-4 h-4" />
            Re-Initialize Module
          </button>
          <Link
            href="/"
            className="flex-1 flex items-center justify-center bg-white/5 hover:bg-white/10 text-sand-beige py-3 px-6 rounded-xl font-bold transition-all border border-white/10"
          >
            Return to Base
          </Link>
        </div>
      </div>
    </div>
  );
}
