import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "danger";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children?: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  className?: string;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:opacity-90 focus-visible:ring-primary shadow-sm",
  secondary:
    "bg-secondary text-secondary-foreground border border-border hover:opacity-90 focus-visible:ring-secondary shadow-sm",
  outline:
    "border border-border bg-background text-foreground hover:bg-muted focus-visible:ring-primary shadow-xs",
  ghost:
    "bg-transparent text-foreground hover:bg-muted focus-visible:ring-primary",
  danger:
    "bg-destructive text-destructive-foreground hover:opacity-90 focus-visible:ring-destructive shadow-sm",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "min-h-9 px-3 py-1.5 text-xs gap-1.5 rounded-lg",
  md: "min-h-11 px-4 py-2 text-sm gap-2 rounded-xl",
  lg: "min-h-12 px-6 py-3 text-base gap-2.5 rounded-xl",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  isLoading = false,
  loadingLabel = "Loading…",
  disabled,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const isBusy = Boolean(loading || isLoading);
  const isDisabled = Boolean(disabled || isBusy);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isBusy || undefined}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "active:scale-[0.98]",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "cursor-not-allowed opacity-60 active:scale-100",
        className
      )}
      {...props}
    >
      {isBusy ? (
        <span className="inline-flex items-center gap-2">
          <svg
            className="h-4 w-4 animate-spin text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>{loadingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
