"use client";

import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface RetryButtonProps {
  onRetry: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  attempt?: number;
  className?: string;
}

export function RetryButton({
  onRetry,
  isLoading = false,
  disabled = false,
  label = "Try Again",
  attempt,
  className = "",
}: RetryButtonProps) {
  return (
    <Button
      type="button"
      variant="primary"
      size="md"
      onClick={onRetry}
      disabled={disabled || isLoading}
      isLoading={isLoading}
      aria-label={label}
      className={`inline-flex items-center gap-2 ${className}`}
    >
      <RotateCcw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>
        {isLoading ? "Retrying..." : label}
        {attempt && attempt > 0 ? ` (${attempt})` : ""}
      </span>
    </Button>
  );
}
