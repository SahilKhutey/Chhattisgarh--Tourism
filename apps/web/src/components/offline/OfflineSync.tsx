"use client";

import { useEffect } from "react";
import { syncOfflineQueue } from "@/lib/offline/sync";

export function OfflineSync() {
  useEffect(() => {
    const synchronize = async () => {
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        return;
      }

      try {
        await syncOfflineQueue();
      } catch (error) {
        console.debug("Offline synchronization error:", error);
      }
    };

    // Attempt synchronization on mount
    synchronize();

    const handleOnline = () => {
      synchronize();
    };

    // Listen for Service Worker background sync message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "OFFLINE_SYNC_REQUIRED") {
        synchronize();
      }
    };

    window.addEventListener("online", handleOnline);
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleMessage);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleMessage);
      }
    };
  }, []);

  return null;
}
