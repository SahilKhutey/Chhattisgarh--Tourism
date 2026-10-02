"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ErrorState } from "@/components/feedback/ErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to APM / monitoring in production
    console.error("UI System Failure Caught:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[75vh] p-4 sm:p-8 w-full">
      <ErrorState
        title="Application Rendering Exception"
        description="A failure occurred within the active component tree. Our resilience systems have sandboxed the error to protect your experience."
        code={error.name || "RENDER_ERROR"}
        requestId={error.digest}
        onRetry={reset}
        retryLabel="Re-Initialize Module"
        action={
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Return to Base
          </Link>
        }
      />
    </div>
  );
}
