"use client";

import { useEffect } from "react";
import { ErrorState as CanonicalErrorState } from "@/components/feedback/ErrorState";

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
    <CanonicalErrorState
      title={title}
      description={description}
      onRetry={reset}
      code={error?.name}
      requestId={error?.digest}
      className="mx-auto max-w-xl my-8"
    />
  );
}
