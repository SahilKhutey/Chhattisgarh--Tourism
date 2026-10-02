"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { RetryButton } from "../Retry/RetryButton";
import { cn } from "@/lib/ui/cn";

export interface ErrorStateProps {
  title?: string;
  description: string;
  onRetry?: () => void;
  retryLabel?: string;
  isRetrying?: boolean;
  requestId?: string;
  code?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description,
  onRetry,
  retryLabel = "Try Again",
  isRetrying = false,
  requestId,
  code,
  icon,
  action,
  className = "",
}: ErrorStateProps) {
  return (
    <section
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12 dark:border-destructive/30 dark:bg-destructive/10",
        className,
      )}
    >
      <div className="mb-3.5 flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive dark:bg-destructive/20">
        {icon || <AlertCircle className="h-6 w-6 text-destructive" />}
      </div>

      <h2 className="text-base font-bold text-foreground sm:text-lg">
        {title}
      </h2>

      <p className="mt-1.5 max-w-md text-xs text-muted-foreground sm:text-sm leading-relaxed">
        {description}
      </p>

      {(code || requestId) && (
        <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-muted-foreground/75">
          {code && <span>Ref: {code}</span>}
          {code && requestId && <span>•</span>}
          {requestId && <span>ID: {requestId}</span>}
        </div>
      )}

      {(onRetry || action) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {onRetry && (
            <RetryButton
              onRetry={onRetry}
              isLoading={isRetrying}
              label={retryLabel}
            />
          )}
          {action}
        </div>
      )}
    </section>
  );
}
