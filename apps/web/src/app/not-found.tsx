"use client";

import Link from "next/link";
import { Search, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0D0F] text-charcoal-stone h-screen w-full">
      <div className="flex flex-col items-center text-center max-w-lg gap-8">
        
        <div className="relative">
          <div className="text-[150px] font-sans font-black text-white/5 leading-none select-none">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-forest-emerald">
            <Compass className="w-24 h-24 opacity-80" />
          </div>
        </div>

        <div className="flex flex-col gap-2 -mt-8">
          <span className="text-sm font-mono font-bold tracking-widest text-tribal-terracotta uppercase">
            Navigation Failure
          </span>
          <h2 className="text-4xl font-sans font-bold text-sand-beige">
            Sector Not Found
          </h2>
          <p className="text-sm text-charcoal-stone/50 font-mono mt-2 leading-relaxed">
            The requested digital coordinate does not exist in the current ecosystem. The module may have been encrypted, moved, or deleted.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-forest-emerald hover:bg-emerald-800 text-sand-beige py-3 px-8 rounded-xl font-bold transition-all shadow-md shadow-forest-emerald/20 hover:-translate-y-0.5"
        >
          <Search className="w-4 h-4" />
          Recalculate Route to Base
        </Link>
      </div>
    </div>
  );
}
