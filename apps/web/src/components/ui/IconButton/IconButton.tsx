import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import { ButtonVariant, ButtonSize } from "../Button";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon?: ReactNode;
  children?: ReactNode;
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
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
  sm: "h-9 w-9 p-1.5 text-xs rounded-lg",
  md: "h-11 w-11 p-2 text-sm rounded-xl",
  lg: "h-12 w-12 p-2.5 text-base rounded-xl",
};

export function IconButton({
  icon,
  children,
  label,
  variant = "ghost",
  size = "md",
  loading = false,
  isLoading = false,
  disabled,
  className = "",
  type = "button",
  "aria-label": ariaLabel,
  title,
  ...props
}: IconButtonProps) {
  const isBusy = Boolean(loading || isLoading);
  const isDisabled = Boolean(disabled || isBusy);
  const accessibleName = ariaLabel || label;

  return (
    <button
      type={type}
      aria-label={accessibleName}
      title={title || accessibleName}
      disabled={isDisabled}
      aria-busy={isBusy || undefined}
      className={cn(
        "cg-interactive inline-flex items-center justify-center font-medium select-none shrink-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && "cursor-not-allowed opacity-60 active:scale-100",
        className
      )}
      {...props}
    >
      {isBusy ? (
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
      ) : (
        icon || children
      )}
    </button>
  );
}
