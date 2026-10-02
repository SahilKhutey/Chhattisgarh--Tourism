"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { ErrorState } from "./ErrorState";

export interface NetworkErrorProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({
  title = "We couldn't connect",
  description = "Please check your internet connection or mobile signal and try again.",
  onRetry,
  className = "",
}: NetworkErrorProps) {
  return (
    <ErrorState
      title={title}
      description={description}
      onRetry={onRetry}
      retryLabel="Check Connection & Try Again"
      icon={<WifiOff className="h-6 w-6 text-destructive" />}
      className={className}
    />
  );
}
