"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [online, setOnline] = useState<boolean>(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setOnline(navigator.onLine);
    }

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (online) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-center text-xs sm:text-sm font-semibold text-amber-950 shadow-sm transition-all"
    >
      <WifiOff className="h-4 w-4 shrink-0 text-amber-800" />
      <span>
        You are offline. Cached tourism content and offline actions remain available.
      </span>
    </div>
  );
}
