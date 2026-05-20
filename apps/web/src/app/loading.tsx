"use client";

import { Compass } from "lucide-react";

export default function GlobalLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0B0D0F] text-charcoal-stone h-full w-full min-h-[50vh]">
      <div className="flex flex-col items-center gap-6">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-t-2 border-forest-emerald/20 animate-spin" style={{ animationDuration: '3s' }}></div>
          <div className="absolute w-16 h-16 rounded-full border-r-2 border-tribal-terracotta/40 animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/10">
            <Compass className="w-6 h-6 text-sand-beige animate-pulse" />
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-mono font-bold tracking-widest text-forest-emerald uppercase animate-pulse">
            Establishing Secure Link
          </span>
          <span className="text-xs font-mono text-charcoal-stone/40">
            Resolving geographical & cultural nodes...
          </span>
        </div>
      </div>
    </div>
  );
}
