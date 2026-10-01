import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { Button } from "@/components/ui/Button";

export interface SuccessStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: ReactNode;
  className?: string;
}

export function SuccessState({
  title,
  message,
  actionText,
  onAction,
  icon,
  className = "",
  ...props
}: SuccessStateProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "cg-motion-scale-in flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-emerald-500/20 bg-emerald-950/10",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600/20 text-emerald-500 shadow-inner">
        {icon || (
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>

      <h3 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h3>

      {message && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm leading-relaxed">
          {message}
        </p>
      )}

      {actionText && onAction && (
        <div className="mt-6">
          <Button variant="primary" size="sm" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
}
