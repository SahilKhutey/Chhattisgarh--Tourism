import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

export interface ErrorMessageProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  message: string;
  error?: Error | unknown;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: ReactNode;
  className?: string;
}

export function ErrorMessage({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
  icon,
  className = "",
  ...props
}: ErrorMessageProps) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive",
        className
      )}
      {...props}
    >
      <div className="mb-3 text-destructive">
        {icon || (
          <svg
            className="h-10 w-10 text-destructive/80"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        )}
      </div>
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <div className="mt-5">
          <Button variant="danger" size="sm" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
