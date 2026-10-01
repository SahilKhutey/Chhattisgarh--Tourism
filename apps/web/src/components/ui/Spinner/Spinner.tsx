import type { HTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

export type SpinnerSize = "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "primary" | "muted" | "current" | "white";

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  className?: string;
}

const sizeStyles: Record<SpinnerSize, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-3",
  xl: "h-12 w-12 border-4",
};

const variantStyles: Record<SpinnerVariant, string> = {
  primary: "border-primary/20 border-t-primary",
  muted: "border-muted-foreground/20 border-t-muted-foreground",
  current: "border-current/20 border-t-current",
  white: "border-white/20 border-t-white",
};

export function Spinner({
  size = "md",
  variant = "primary",
  label = "Loading…",
  className = "",
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <div
        className={cn(
          "rounded-full animate-spin",
          sizeStyles[size],
          variantStyles[variant]
        )}
      />
      <span className="sr-only">{label}</span>
    </div>
  );
}
