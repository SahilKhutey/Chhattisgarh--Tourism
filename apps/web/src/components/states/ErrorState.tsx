"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface ErrorStateProps {
  error: Error & { digest?: string };
  reset?: () => void;
  title?: string;
  description?: string;
}

export function ErrorState({
  error,
  reset,
  title = "Something went wrong",
  description = "We couldn't load this tourism information. Please try again.",
}: ErrorStateProps) {
  useEffect(() => {
    console.error("[ErrorState]", error);
  }, [error]);

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-[40vh] max-w-xl flex-col items-center justify-center px-6 text-center"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
        <AlertCircle className="h-7 w-7" />
      </div>

      <h2 className="text-2xl font-semibold text-charcoal-stone">
        {title}
      </h2>

      <p className="mt-3 text-sm text-charcoal-stone/60">
        {description}
      </p>

      {reset && (
        <Button
          className="mt-6"
          onClick={reset}
        >
          Try again
        </Button>
      )}
    </div>
  );
}
