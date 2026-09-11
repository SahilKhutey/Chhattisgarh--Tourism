"use client";

import React, { useEffect } from "react";
import { ContentError } from "@/components/public-content/ContentError";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Public route error:", error);
  }, [error]);

  return (
    <ContentError
      title="Something went wrong"
      message="We couldn't load this tourism page right now. Please try again or return home."
      reset={reset}
    />
  );
}
